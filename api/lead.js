// POST /api/lead — guarda contacto + 7 respuestas en GHL y califica en el servidor.
// Responde { qualified, token? , mock? }. Solo los calificados reciben token para reservar.
import { validateLead, isQualified, estimateMonthlyRange, formatRange, QUESTIONS } from "../shared/form.js";
import { route, readJson, send, assertConfigured, HttpError } from "./_lib/http.js";
import { upsertContact, addNote } from "./_lib/ghl.js";
import { issueToken } from "./_lib/token.js";

function noteFor(lead, qualified, rangeLabel) {
  const lines = [
    `Formulario BNB390 · ${qualified ? "CALIFICADO" : "NO CALIFICADO"}`,
    `Ciudad o zona: ${lead.city}`,
    `Rango estimado de facturación total: ${rangeLabel}`,
    "",
  ];
  for (const q of QUESTIONS) {
    const v = lead[q.id];
    const label = q.id === "q7_inversion" ? "¿Dispuesto a invertir?" : q.label;
    lines.push(`${label}\n→ ${Array.isArray(v) ? v.join("; ") : v}`, "");
  }
  return lines.join("\n");
}

export default route("POST", async (req, res) => {
  const body = await readJson(req);

  // Campo trampa para bots: si viene relleno, se responde como si nada pero no se guarda.
  if (body.website) return send(res, 200, { qualified: false });

  const { ok, errors, data } = validateLead(body);
  if (!ok) throw new HttpError(400, "invalid", { fields: errors });

  const qualified = isQualified(data);
  const rangeLabel = formatRange(estimateMonthlyRange(data.q2_propiedades, data.q3_facturacion));
  const m = assertConfigured();

  let contactId;
  if (m === "mock") {
    contactId = "mock-" + Math.random().toString(36).slice(2, 10);
    console.log("[mock] lead", { qualified, rangeLabel, email: data.email });
  } else {
    contactId = await upsertContact(data, { qualified, rangeLabel });
    await addNote(contactId, noteFor(data, qualified, rangeLabel));
  }

  return send(res, 200, {
    qualified,
    token: qualified ? issueToken({ contactId, name: data.name, email: data.email }) : undefined,
    mock: m === "mock" || undefined,
  });
});
