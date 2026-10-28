// POST /api/book { token, startTime } — reserva la llamada de 60 minutos en el calendario de GHL.
import { route, readJson, send, assertConfigured, HttpError } from "./_lib/http.js";
import { verifyToken } from "./_lib/token.js";
import { getFreeSlots, createAppointment } from "./_lib/ghl.js";
import { mockSlots } from "./_lib/mock.js";

const DURATION_MIN = 60;

export default route("POST", async (req, res) => {
  const { token, startTime } = await readJson(req);
  const lead = verifyToken(token);
  if (!lead) throw new HttpError(403, "not_allowed");

  const start = new Date(startTime);
  if (typeof startTime !== "string" || Number.isNaN(start.getTime()) || start.getTime() < Date.now() + 15 * 60 * 1000)
    throw new HttpError(400, "invalid_time");

  const m = assertConfigured();

  // Se comprueba contra la disponibilidad real para no aceptar horarios inventados.
  const dayStart = start.getTime() - 24 * 60 * 60 * 1000;
  const dayEnd = start.getTime() + 24 * 60 * 60 * 1000;
  const days = m === "mock" ? mockSlots(Date.now()) : await getFreeSlots(dayStart, dayEnd, "UTC");
  const free = days.flatMap((d) => d.slots).some((s) => new Date(s).getTime() === start.getTime());
  if (!free) throw new HttpError(409, "slot_unavailable");

  const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000);
  let appointmentId = null;
  if (m === "mock") {
    console.log("[mock] booking", { contact: lead.cid, startTime: start.toISOString() });
    appointmentId = "mock-appt";
  } else {
    appointmentId = await createAppointment({
      contactId: lead.cid,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      title: `BNB390 · Llamada con ${lead.n || "prospecto"}`,
    });
  }

  return send(res, 200, { ok: true, appointmentId, startTime: start.toISOString(), endTime: end.toISOString(), mock: m === "mock" || undefined });
});
