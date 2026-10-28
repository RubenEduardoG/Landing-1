// Llamadas al backend (/api/*). Devuelve { ok, status, data }.
async function call(path, options = {}) {
  try {
    const r = await fetch(path, {
      ...options,
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) },
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "network" } };
  }
}

export const submitLead = (lead) => call("/api/lead", { method: "POST", body: JSON.stringify(lead) });

export const fetchSlots = (token, tz) =>
  call(`/api/slots?${new URLSearchParams({ token, tz })}`);

export const bookSlot = (token, startTime) =>
  call("/api/book", { method: "POST", body: JSON.stringify({ token, startTime }) });

export function errorMessage(res) {
  switch (res.data?.error) {
    case "network":
      return "No hay conexión. Revisa tu internet y vuelve a intentarlo.";
    case "invalid":
      return "Revisa los datos marcados y vuelve a enviar.";
    case "not_allowed":
      return "Tu sesión para reservar venció. Recarga la página y completa el formulario de nuevo.";
    case "slot_unavailable":
      return "Ese horario se acaba de ocupar. Elige otro.";
    case "not_configured":
      return "Las reservas todavía no están activas. Inténtalo más tarde.";
    default:
      return "No pudimos completar el envío. Vuelve a intentarlo en unos segundos.";
  }
}
