// =======================================
// Setup entrypoint
// =======================================
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from '@vuer-ai/react-helmet-async';
import './index.css';
import App from './App.tsx';

// React 18 rootの作成し、HelmetProviderでSEOタグを提供
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
