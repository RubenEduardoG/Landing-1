// Definición única del formulario de calificación BNB390.
// La usan el frontend (para pintar y validar cada paso) y la API (para validar y calificar en el servidor).

export const QUESTIONS = [
  {
    id: "q1_situacion",
    type: "single",
    label: "¿Cuál es tu situación actual?",
    options: [
      "Tengo 1 o más propiedades en Airbnb y quiero que facturen más.",
      "Gestiono propiedades de otros y quiero profesionalizarme o escalar.",
      "Tengo una propiedad parada o sin optimizar y quiero activarla.",
      "Aún no tengo propiedades ni clientes, quiero empezar.",
    ],
    disqualify: "Aún no tengo propiedades ni clientes, quiero empezar.",
  },
  {
    id: "q2_propiedades",
    type: "single",
    label: "¿Cuántas propiedades tienes o gestionas?",
    options: ["1", "2–5", "6–15", "16–50", "Más de 50"],
    grid: true,
  },
  {
    id: "q3_facturacion",
    type: "single",
    label: "¿Cuál es la facturación mensual promedio por propiedad?",
    help: "Si tienes varias, piensa en la media. No hace falta que sea exacto.",
    options: [
      "Menos de $1.000",
      "$1.000 – $2.000",
      "$2.000 – $4.000",
      "$4.000 – $7.000",
      "Más de $7.000",
      "No lo sé con exactitud",
    ],
    grid: true,
  },
  {
    id: "q4_objetivo",
    type: "text",
    label: "¿Qué te gustaría conseguir en los próximos 90 días?",
    placeholder: "Ej.: que mi casa pase de 3.000 a 5.000 al mes · pasar de 10 a 20 propiedades gestionadas",
  },
  {
    id: "q5_freno",
    type: "multi",
    label: "¿Cuál es el principal freno de tu negocio?",
    help: "Si no lo sabes, es normal. Detectarlo es lo primero que hacemos en la llamada. Puedes marcar varias.",
    options: [
      "Me ven poco en Airbnb.",
      "Me visitan, pero no reservan.",
      "Creo que cobro menos de lo que vale.",
      "Tengo huecos en el calendario.",
      "Las reviews me penalizan.",
      "No consigo captar más propietarios.",
      "La operativa me come y no puedo crecer.",
      "No lo sé, y eso es lo que más me preocupa.",
    ],
  },
  {
    id: "q6_probado",
    type: "text",
    label: "¿Qué has probado ya y por qué crees que no ha funcionado?",
    help: "Cuanto más concreto seas, más personalizada será la llamada.",
  },
  {
    id: "q7_inversion",
    type: "single",
    long: true,
    label:
      "BNB390 es un acompañamiento 1:1 de 90 días conmigo, 100% personalizado, que para comenzar requiere de una inversión como cualquier otro negocio. ¿Estás dispuesto a invertir si es la solución específica que estás necesitando para escalar tu negocio al próximo nivel de facturación?",
    options: [
      "Si, quiero invertir en el crecimiento de mi negocio.",
      "No, aún no quiero invertir en el crecimiento de mi negocio.",
    ],
    disqualify: "No, aún no quiero invertir en el crecimiento de mi negocio.",
  },
];

export const CONTACT_FIELDS = [
  { id: "name", label: "Nombre", type: "text", autoComplete: "name", max: 120 },
  { id: "phone", label: "Teléfono", type: "tel", autoComplete: "tel", placeholder: "+34 600 000 000", max: 40 },
  { id: "email", label: "Email", type: "email", autoComplete: "email", max: 200 },
  { id: "city", label: "Ciudad o zona de tus propiedades", type: "text", max: 160 },
];

const TEXT_MAX = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s.-]{6,40}$/;

const clean = (v) => (typeof v === "string" ? v.trim() : "");

/** Valida un campo de contacto. Devuelve un mensaje de error o "". */
export function validateContactField(id, value) {
  const f = CONTACT_FIELDS.find((x) => x.id === id);
  const v = clean(value);
  if (!v) return "Completa este campo para continuar.";
  if (v.length > f.max) return "Este dato es demasiado largo.";
  if (id === "email" && !EMAIL_RE.test(v)) return "Revisa el formato del email.";
  if (id === "phone" && (!PHONE_RE.test(v) || v.replace(/\D/g, "").length < 6))
    return "Revisa el teléfono: usa solo números y, si quieres, el prefijo con +.";
  return "";
}

/** Valida la respuesta a una pregunta. Devuelve un mensaje de error o "". */
export function validateAnswer(q, value) {
  if (q.type === "single") {
    return q.options.includes(value) ? "" : "Elige una opción para continuar.";
  }
  if (q.type === "multi") {
    if (!Array.isArray(value) || value.length === 0) return "Marca al menos una opción.";
    return value.every((v) => q.options.includes(v)) ? "" : "Hay una opción que no es válida.";
  }
  const v = clean(value);
  if (!v) return "Completa este campo para continuar.";
  if (v.length > TEXT_MAX) return `Escribe como máximo ${TEXT_MAX} caracteres.`;
  return "";
}

/** Valida el envío completo. Devuelve { ok, errors, data } con los datos limpios. */
export function validateLead(input = {}) {
  const errors = {};
  const data = {};
  for (const f of CONTACT_FIELDS) {
    const e = validateContactField(f.id, input[f.id]);
    if (e) errors[f.id] = e;
    else data[f.id] = clean(input[f.id]);
  }
  if (input.consent !== true) errors.consent = "Necesitamos tu aceptación para gestionar la llamada.";
  for (const q of QUESTIONS) {
    const value = input[q.id];
    const e = validateAnswer(q, value);
    if (e) errors[q.id] = e;
    else data[q.id] = q.type === "text" ? clean(value) : value;
  }
  return { ok: Object.keys(errors).length === 0, errors, data };
}

/** Regla de calificación: descalifica P1 "Aún no tengo…" y P7 "No…". */
export function isQualified(data) {
  return QUESTIONS.every((q) => !q.disqualify || data[q.id] !== q.disqualify);
}

const PROPS = { "1": [1, 1], "2–5": [2, 5], "6–15": [6, 15], "16–50": [16, 50], "Más de 50": [51, null] };
const REV = {
  "Menos de $1.000": [0, 1000],
  "$1.000 – $2.000": [1000, 2000],
  "$2.000 – $4.000": [2000, 4000],
  "$4.000 – $7.000": [4000, 7000],
  "Más de $7.000": [7000, null],
};

/**
 * Rango aproximado de facturación mensual total (P2 × P3). Es un intervalo, nunca un importe exacto.
 * Devuelve { min, max } (max = null si no tiene techo) o null si no se puede estimar.
 */
export function estimateMonthlyRange(q2, q3) {
  const p = PROPS[q2];
  const r = REV[q3];
  if (!p || !r) return null;
  return { min: p[0] * r[0], max: p[1] == null || r[1] == null ? null : p[1] * r[1] };
}

export function formatRange(range) {
  if (!range) return "Sin estimar";
  const n = (x) => "$" + String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return range.max == null ? `Más de ${n(range.min)} / mes` : `${n(range.min)} – ${n(range.max)} / mes`;
}
