// GET /api/slots?token=…&tz=Europe/Madrid — horarios libres de los próximos 14 días.
import { route, query, send, assertConfigured, HttpError } from "./_lib/http.js";
import { verifyToken } from "./_lib/token.js";
import { getFreeSlots } from "./_lib/ghl.js";
import { mockSlots } from "./_lib/mock.js";

const DAYS = 14;

export function validTimeZone(tz) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export default route("GET", async (req, res) => {
  const q = query(req);
  if (!verifyToken(q.get("token"))) throw new HttpError(403, "not_allowed");
  const tz = validTimeZone(q.get("tz")) ? q.get("tz") : "Europe/Madrid";
  const m = assertConfigured();

  const start = Date.now();
  const end = start + DAYS * 24 * 60 * 60 * 1000;
  const days = m === "mock" ? mockSlots(start, DAYS) : await getFreeSlots(start, end, tz);

  return send(res, 200, { days, mock: m === "mock" || undefined });
});
