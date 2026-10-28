// Utilidades HTTP compatibles con Vercel Functions (Node) y con el servidor de desarrollo de Vite.

const MAX_BODY = 50 * 1024;

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new HttpError(413, "payload_too_large");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

export function query(req) {
  return new URL(req.url, "http://localhost").searchParams;
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export class HttpError extends Error {
  constructor(status, code, extra = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

/** Envuelve un handler: método permitido + errores como JSON. */
export function route(method, fn) {
  return async (req, res) => {
    if (req.method !== method) {
      res.setHeader("Allow", method);
      return send(res, 405, { error: "method_not_allowed" });
    }
    try {
      await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.code, ...e.extra });
      console.error("[api]", e);
      return send(res, 502, { error: "upstream_error" });
    }
  };
}

/** Modo demo: sin credenciales de GHL y fuera de producción. */
export function mode() {
  const configured = Boolean(process.env.GHL_TOKEN && process.env.GHL_LOCATION_ID && process.env.GHL_CALENDAR_ID);
  if (configured) return "live";
  if (process.env.VERCEL_ENV === "production") return "unconfigured";
  return "mock";
}

export function assertConfigured() {
  const m = mode();
  if (m === "unconfigured") throw new HttpError(503, "not_configured");
  return m;
}
