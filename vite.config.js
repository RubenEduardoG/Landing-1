import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, sirve /api/* con los mismos handlers que usa Vercel en producción.
function vercelApiDev() {
  return {
    name: "vercel-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        const m = url.pathname.match(/^\/api\/([a-z-]+)\/?$/);
        if (!m) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`);
          await mod.default(req, res);
        } catch (e) {
          server.ssrFixStacktrace(e);
          console.error(e);
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "not_found" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Variables sin prefijo VITE_ (GHL_TOKEN, etc.) disponibles para la API en local.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return { plugins: [react(), vercelApiDev()] };
});
