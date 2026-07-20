import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// We don't need fileURLToPath since the compiled file is CJS and we can just use process.cwd() or similar.
const __dirname = path.resolve();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add CORS headers to all responses to support sandboxed/null origin iframe requests
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Increase body size limit to support base64 file attachments
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // The actual Google Apps Script Web App URL
  const ACTUAL_GAS_URL = "https://script.google.com/macros/s/AKfycbwHMFb-zRZb-13NebtoGW_MxVMuynd4qEIrKY6uUPF_ulbyVX5bSW7t1SjV2uqRFoe2/exec";

  // Proxy endpoint to bypass CORS and sandboxed iframe fetch limitations
  app.all("/api/proxy", async (req, res) => {
    try {
      const method = req.method;
      console.log(`[Proxy] Routing ${method} request to Google Apps Script`);

      // Prepare headers
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
      };

      let fetchOptions: any = {
        method,
        headers,
        redirect: "follow", // Crucial for Google Apps Script 302 redirects
      };

      if (method === "POST") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        
        // Construct standard URLSearchParams body
        const params = new URLSearchParams();
        const bodyObj = req.body || {};
        for (const [key, val] of Object.entries(bodyObj)) {
          params.append(key, String(val));
        }
        fetchOptions.body = params.toString();
      }

      // Execute fetch to the actual Google Apps Script Web App
      const gasResponse = await fetch(ACTUAL_GAS_URL, fetchOptions);
      const responseText = await gasResponse.text();

      console.log(`[Proxy] Google Apps Script responded with status ${gasResponse.status}`);

      // Try to return as JSON if possible
      try {
        const json = JSON.parse(responseText);
        return res.status(gasResponse.status).json(json);
      } catch (jsonErr) {
        // It's not valid JSON. Check if it's a GAS HTML error page.
        if (responseText.includes("<title>Error</title>")) {
          // Extract the error message from the HTML if possible
          const match = responseText.match(/<div[^>]*font-family:monospace[^>]*>([^<]+)<\/div>/);
          const errorMsg = match ? match[1].replace(/&quot;/g, '"') : "Internal Google Apps Script Error";
          return res.status(500).json({ 
            error: "GAS_ERROR", 
            message: `Error di Google Apps Script: ${errorMsg}. Hapus pemanggilan .setHeader() pada baris kode tersebut.` 
          });
        }
        
        // Otherwise just send the plain text
        return res.status(gasResponse.status).send(responseText);
      }
    } catch (error: any) {
      console.error("[Proxy Error] Failed to contact Google Apps Script:", error);
      res.status(500).json({
        error: "Proxy failed",
        message: error.message || String(error),
        tip: "Pastikan Google Apps Script (GAS) Anda telah dideploy sebagai Web App dengan izin akses 'Anyone'."
      });
    }
  });

  // Serve Vite in development, or compiled static files in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Running in DEVELOPMENT mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Running in PRODUCTION mode serving dist/ folder");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server successfully running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server Startup Error] Failed to launch server:", err);
});
