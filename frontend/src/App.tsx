import { useEffect, useState } from "react";
import { fetchHealth } from "./lib/api";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardContent } from "./components/ui/card";

function App() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    fetchHealth()
      .then((t) => setStatus(t))
      .catch((e) => setStatus(`error: ${e.message}`));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Frontend ↔ Backend Health Check</h1>
        <Card>
          <CardHeader>Backend /health</CardHeader>
          <CardContent>
            <p>status: {status}</p>
            <div className="mt-3">
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
