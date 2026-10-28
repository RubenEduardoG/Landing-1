import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS, validateLead, isQualified, estimateMonthlyRange, formatRange } from "../shared/form.js";
import { issueToken, verifyToken } from "../api/_lib/token.js";

const base = {
  name: "Ana Pérez",
  phone: "+34 600 111 222",
  email: "ana@example.com",
  city: "Valencia",
  consent: true,
  q1_situacion: QUESTIONS[0].options[0],
  q2_propiedades: "2–5",
  q3_facturacion: "$2.000 – $4.000",
  q4_objetivo: "Pasar de 3.000 a 5.000 al mes",
  q5_freno: ["Me visitan, pero no reservan."],
  q6_probado: "Cambié fotos sin resultado",
  q7_inversion: QUESTIONS[6].options[0],
};

test("un envío completo es válido y califica", () => {
  const r = validateLead(base);
  assert.equal(r.ok, true);
  assert.equal(isQualified(r.data), true);
});

test("P1 'Aún no tengo propiedades' descalifica", () => {
  const r = validateLead({ ...base, q1_situacion: QUESTIONS[0].disqualify });
  assert.equal(r.ok, true);
  assert.equal(isQualified(r.data), false);
});

test("P7 'No quiero invertir' descalifica", () => {
  const r = validateLead({ ...base, q7_inversion: QUESTIONS[6].disqualify });
  assert.equal(isQualified(r.data), false);
});

test("rechaza opciones inventadas, email inválido y falta de consentimiento", () => {
  const r = validateLead({ ...base, q2_propiedades: "1000", email: "no-es-email", consent: false, q5_freno: ["Otra"] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.q2_propiedades && r.errors.email && r.errors.consent && r.errors.q5_freno);
});

test("rechaza textos vacíos o demasiado largos", () => {
  assert.equal(validateLead({ ...base, q4_objetivo: "   " }).ok, false);
  assert.equal(validateLead({ ...base, q6_probado: "x".repeat(2001) }).ok, false);
});

test("rango estimado P2 × P3", () => {
  assert.deepEqual(estimateMonthlyRange("2–5", "$2.000 – $4.000"), { min: 4000, max: 20000 });
  assert.deepEqual(estimateMonthlyRange("Más de 50", "Más de $7.000"), { min: 357000, max: null });
  assert.equal(estimateMonthlyRange("1", "No lo sé con exactitud"), null);
  assert.equal(formatRange(null), "Sin estimar");
});

test("token: válido, manipulado y vencido", () => {
  const t = issueToken({ contactId: "c1", name: "Ana", email: "a@b.co" });
  assert.equal(verifyToken(t).cid, "c1");
  const [p, s] = t.split(".");
  assert.equal(verifyToken(`${p}x.${s}`), null);
  assert.equal(verifyToken(t, Date.now() + 3 * 60 * 60 * 1000), null);
  assert.equal(verifyToken("basura"), null);
});
