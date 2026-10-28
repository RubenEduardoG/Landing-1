// Datos de demostración para desarrollar sin credenciales de GHL. Nunca se usan en producción.

/** Horarios de ejemplo: días laborables, 10:00–17:00 hora de Madrid (aprox. UTC+1), cada hora. */
export function mockSlots(startMs, days = 14) {
  const out = [];
  const start = new Date(startMs);
  for (let d = 1; out.length < 10 && d <= days; d++) {
    const day = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + d));
    const wd = day.getUTCDay();
    if (wd === 0 || wd === 6) continue;
    const date = day.toISOString().slice(0, 10);
    const slots = [9, 10, 11, 12, 14, 15, 16].map((h) => new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h)).toISOString());
    out.push({ date, slots });
  }
  return out;
}
