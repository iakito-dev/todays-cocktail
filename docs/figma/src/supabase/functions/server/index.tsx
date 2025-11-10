// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to create Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

// Helper to get user from token
const getUserFromToken = async (token: string) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  return user;
};

// Health check endpoint
app.get("/make-server-bea9ce3f/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// Authentication Routes
// ============================================

// Sign up
app.post("/make-server-bea9ce3f/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();
    
    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to sign up user' }, 500);
  }
});

// Login
app.post("/make-server-bea9ce3f/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return c.json({ error: error.message }, 401);
    }

    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

// ============================================
// Favorites Routes
// ============================================

// Get user favorites
app.get("/make-server-bea9ce3f/favorites", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const user = await getUserFromToken(token);
    const favoritesKey = `favorites:${user.id}`;
    
    const favorites = await kv.get(favoritesKey) || [];
    
    return c.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    return c.json({ error: 'Failed to get favorites' }, 500);
  }
});

// Add favorite
app.post("/make-server-bea9ce3f/favorites", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { cocktailId } = await c.req.json();
    
    if (!cocktailId) {
      return c.json({ error: 'Cocktail ID is required' }, 400);
    }

    const user = await getUserFromToken(token);
    const favoritesKey = `favorites:${user.id}`;
    
    const favorites = await kv.get(favoritesKey) || [];
    
    if (!favorites.includes(cocktailId)) {
      favorites.push(cocktailId);
      await kv.set(favoritesKey, favorites);
    }
    
    return c.json({ favorites });
  } catch (error) {
    console.error('Add favorite error:', error);
    return c.json({ error: 'Failed to add favorite' }, 500);
  }
});

// Remove favorite
app.delete("/make-server-bea9ce3f/favorites/:cocktailId", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const cocktailId = c.req.param('cocktailId');
    
    const user = await getUserFromToken(token);
    const favoritesKey = `favorites:${user.id}`;
    
    const favorites = await kv.get(favoritesKey) || [];
    const updatedFavorites = favorites.filter((id: string) => id !== cocktailId);
    
    await kv.set(favoritesKey, updatedFavorites);
    
    return c.json({ favorites: updatedFavorites });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return c.json({ error: 'Failed to remove favorite' }, 500);
  }
});

// Toggle favorite
app.post("/make-server-bea9ce3f/favorites/toggle", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { cocktailId } = await c.req.json();
    
    if (!cocktailId) {
      return c.json({ error: 'Cocktail ID is required' }, 400);
    }

    const user = await getUserFromToken(token);
    const favoritesKey = `favorites:${user.id}`;
    
    const favorites = await kv.get(favoritesKey) || [];
    
    let updatedFavorites;
    if (favorites.includes(cocktailId)) {
      updatedFavorites = favorites.filter((id: string) => id !== cocktailId);
    } else {
      updatedFavorites = [...favorites, cocktailId];
    }
    
    await kv.set(favoritesKey, updatedFavorites);
    
    return c.json({ favorites: updatedFavorites });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return c.json({ error: 'Failed to toggle favorite' }, 500);
  }
});

Deno.serve(app.fetch);