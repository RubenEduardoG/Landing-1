// Cliente mínimo de la API v2 de HighLevel (LeadConnector).
// Requiere un Private Integration Token de la subcuenta con permisos de contactos y calendarios.
// Documentación: https://highlevel.stoplight.io/docs/integrations
import { HttpError } from "./http.js";

const BASE = "https://services.leadconnectorhq.com";
const V_CONTACTS = "2021-07-28";
const V_CALENDARS = "2021-04-15";

async function ghl(path, { method = "GET", body, version = V_CONTACTS } = {}) {
  const r = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GHL_TOKEN}`,
      Version: version,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* respuesta no JSON */
  }
  if (!r.ok) {
    console.error(`[ghl] ${method} ${path} → ${r.status}`, text.slice(0, 500));
    const err = new HttpError(502, "ghl_error");
    err.upstreamStatus = r.status;
    throw err;
  }
  return json;
}

/** Mapeo opcional de campos personalizados: GHL_FIELD_MAP='{"q1_situacion":"<fieldId>",...}' */
function fieldMap() {
  try {
    return JSON.parse(process.env.GHL_FIELD_MAP || "{}");
  } catch {
    console.error("[ghl] GHL_FIELD_MAP no es JSON válido");
    return {};
  }
}

export async function upsertContact(lead, { qualified, rangeLabel }) {
  const map = fieldMap();
  const values = { ...lead, q5_freno: (lead.q5_freno || []).join("; "), rango_estimado: rangeLabel, calificado: qualified ? "Sí" : "No" };
  const customFields = Object.entries(map)
    .filter(([key, id]) => id && values[key] != null)
    .map(([key, id]) => ({ id, field_value: values[key] }));
  const [firstName, ...rest] = lead.name.split(/\s+/);
  const res = await ghl("/contacts/upsert", {
    method: "POST",
    body: {
      locationId: process.env.GHL_LOCATION_ID,
      firstName,
      lastName: rest.join(" ") || undefined,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      source: "Landing BNB390",
      tags: ["bnb390", qualified ? "bnb390-calificado" : "bnb390-no-calificado"],
      ...(customFields.length ? { customFields } : {}),
    },
  });
  const id = res?.contact?.id;
  if (!id) throw new HttpError(502, "ghl_error");
  return id;
}

export async function addNote(contactId, body) {
  await ghl(`/contacts/${encodeURIComponent(contactId)}/notes`, { method: "POST", body: { body } });
}

/** Horarios libres entre dos instantes (ms). Devuelve [{ date, slots: [iso] }]. */
export async function getFreeSlots(startMs, endMs, timezone) {
  const qs = new URLSearchParams({ startDate: String(startMs), endDate: String(endMs), timezone });
  const res = await ghl(`/calendars/${encodeURIComponent(process.env.GHL_CALENDAR_ID)}/free-slots?${qs}`, {
    version: V_CALENDARS,
  });
  return Object.entries(res)
    .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && Array.isArray(v?.slots))
    .map(([date, v]) => ({ date, slots: v.slots }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createAppointment({ contactId, startTime, endTime, title }) {
  const res = await ghl("/calendars/events/appointments", {
    method: "POST",
    version: V_CALENDARS,
    body: {
      calendarId: process.env.GHL_CALENDAR_ID,
      locationId: process.env.GHL_LOCATION_ID,
      contactId,
      startTime,
      endTime,
      title,
      appointmentStatus: "confirmed",
      toNotify: true,
    },
  }).catch((e) => {
    // GHL responde 400/422 cuando el horario ya no está libre.
    if (e.upstreamStatus === 400 || e.upstreamStatus === 422) throw new HttpError(409, "slot_unavailable");
    throw e;
  });
  return res?.id || res?.appointment?.id || null;
}
