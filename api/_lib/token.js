// Token firmado (HMAC-SHA256) que el servidor entrega solo a prospectos calificados.
// Sin él no se pueden pedir horarios ni reservar, así que saltarse el formulario no sirve.
import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_SECRET = "dev-only-secret-change-me";
const TTL_MS = 2 * 60 * 60 * 1000; // 2 horas para elegir horario

function secret() {
  const s = process.env.LEAD_TOKEN_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.VERCEL_ENV === "production") throw new Error("LEAD_TOKEN_SECRET missing or shorter than 32 chars");
  return DEV_SECRET;
}

const b64 = (buf) => Buffer.from(buf).toString("base64url");
const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function issueToken({ contactId, name, email }, now = Date.now()) {
  const payload = b64(JSON.stringify({ cid: contactId, n: name, e: email, exp: now + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

/** Devuelve el contenido del token o null si es inválido o venció. */
export function verifyToken(token, now = Date.now()) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = sign(payload);
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < now || !data.cid) return null;
    return data;
  } catch {
    return null;
  }
}
