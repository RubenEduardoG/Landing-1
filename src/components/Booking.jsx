import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT_FIELDS, QUESTIONS, validateAnswer, validateContactField } from "../../shared/form.js";
import { CONFIG } from "../config.js";
import { bookSlot, errorMessage, fetchSlots, submitLead } from "../lib/api.js";
import { Pending } from "./ui.jsx";

const STEP_NAMES = ["Situación", "Propiedades", "Facturación", "Objetivo", "Freno", "Lo que has probado", "Inversión"];
const STEPS = [{ id: "contact", name: "Tus datos" }, ...QUESTIONS.map((q, i) => ({ id: q.id, name: STEP_NAMES[i], q }))];

const userTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Madrid";
  } catch {
    return "Europe/Madrid";
  }
};

function Option({ q, value, checked, onChange }) {
  const id = `${q.id}-${q.options.indexOf(value)}`;
  return (
    <label className="opt" htmlFor={id}>
      <input id={id} type={q.type === "multi" ? "checkbox" : "radio"} name={q.id} value={value} checked={checked} onChange={onChange} />
      <span>{value}</span>
    </label>
  );
}

function ContactStep({ values, setValue }) {
  return (
    <fieldset>
      <legend>Tus datos de contacto</legend>
      <div className="fields">
        {CONTACT_FIELDS.map((f) => (
          <label className="f" htmlFor={`f-${f.id}`} key={f.id}>
            {f.label}
            <input
              id={`f-${f.id}`}
              name={f.id}
              type={f.type}
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              maxLength={f.max}
              value={values[f.id] || ""}
              onChange={(e) => setValue(f.id, e.target.value)}
            />
          </label>
        ))}
      </div>
      {/* Campo trampa para bots: invisible para personas. */}
      <input className="hp" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" value={values.website || ""} onChange={(e) => setValue("website", e.target.value)} />
      <label className="consent" htmlFor="f-consent">
        <input id="f-consent" type="checkbox" checked={!!values.consent} onChange={(e) => setValue("consent", e.target.checked)} />
        <span>
          Acepto la{" "}
          {CONFIG.privacyUrl ? (
            <a href={CONFIG.privacyUrl} target="_blank" rel="noopener">
              política de privacidad
            </a>
          ) : (
            "política de privacidad"
          )}{" "}
          y el tratamiento de mis datos para gestionar la llamada. <Pending>Texto legal pendiente</Pending>
        </span>
      </label>
    </fieldset>
  );
}

function QuestionStep({ q, value, setValue }) {
  const toggle = (opt) => {
    const cur = Array.isArray(value) ? value : [];
    setValue(q.id, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  };
  return (
    <fieldset>
      <legend className={q.long ? "long" : undefined}>{q.label}</legend>
      {q.help && <p className="help">{q.help}</p>}
      {q.type === "text" ? (
        <textarea id={`f-${q.id}`} name={q.id} placeholder={q.placeholder} maxLength={2000} value={value || ""} onChange={(e) => setValue(q.id, e.target.value)} />
      ) : (
        <div className={`opts${q.grid ? " grid2" : ""}`}>
          {q.options.map((opt) => (
            <Option
              key={opt}
              q={q}
              value={opt}
              checked={q.type === "multi" ? (value || []).includes(opt) : value === opt}
              onChange={() => (q.type === "multi" ? toggle(opt) : setValue(q.id, opt))}
            />
          ))}
        </div>
      )}
    </fieldset>
  );
}

function validateStep(step, values) {
  if (step.id === "contact") {
    for (const f of CONTACT_FIELDS) {
      const e = validateContactField(f.id, values[f.id]);
      if (e) return { msg: `${f.label}: ${e}`, focus: `f-${f.id}` };
    }
    if (!values.consent) return { msg: "Necesitamos tu aceptación para gestionar la llamada.", focus: "f-consent" };
    return null;
  }
  const e = validateAnswer(step.q, values[step.id]);
  return e ? { msg: e, focus: step.q.type === "text" ? `f-${step.id}` : null } : null;
}

/* ---------- Selector de horario ---------- */

function SlotPicker({ token, onBooked }) {
  const tz = useMemo(userTz, []);
  const [state, setState] = useState({ loading: true, days: [], error: "", mock: false });
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookErr, setBookErr] = useState("");

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    const res = await fetchSlots(token, tz);
    if (!res.ok) return setState({ loading: false, days: [], error: errorMessage(res), mock: false });
    const days = (res.data.days || []).filter((d) => d.slots.length);
    setState({ loading: false, days, error: "", mock: !!res.data.mock });
    setDay((cur) => cur ?? days[0]?.date ?? null);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fmtDay = (d) => {
    const dt = new Date(`${d}T12:00:00`);
    return {
      wd: dt.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
      n: dt.toLocaleDateString("es-ES", { day: "numeric" }),
      m: dt.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
    };
  };
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: tz });

  const confirm = async () => {
    if (!slot) return;
    setBooking(true);
    setBookErr("");
    const res = await bookSlot(token, slot);
    setBooking(false);
    if (res.ok) return onBooked({ startTime: res.data.startTime, tz, mock: !!res.data.mock });
    setBookErr(errorMessage(res));
    if (res.data?.error === "slot_unavailable") {
      setSlot(null);
      load();
    }
  };

  if (state.loading) return <p className="help center-text">Cargando horarios disponibles…</p>;
  if (state.error)
    return (
      <div className="result">
        <p className="err">{state.error}</p>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Reintentar
        </button>
      </div>
    );
  if (!state.days.length)
    return <p className="help center-text">No quedan horarios libres en los próximos 14 días. Vuelve a mirar en unos días.</p>;

  const current = state.days.find((d) => d.date === day) || state.days[0];
  return (
    <div className="picker">
      <div className="days" role="radiogroup" aria-label="Día">
        {state.days.map((d) => {
          const f = fmtDay(d.date);
          return (
            <button
              type="button"
              key={d.date}
              role="radio"
              aria-checked={d.date === current.date}
              className={`day${d.date === current.date ? " on" : ""}`}
              onClick={() => {
                setDay(d.date);
                setSlot(null);
              }}
            >
              <small>{f.wd}</small>
              <b>{f.n}</b>
              <small>{f.m}</small>
            </button>
          );
        })}
      </div>
      <div className="times" role="radiogroup" aria-label="Hora">
        {current.slots.map((s) => (
          <button type="button" key={s} role="radio" aria-checked={slot === s} className={`time${slot === s ? " on" : ""}`} onClick={() => setSlot(s)}>
            {fmtTime(s)}
          </button>
        ))}
      </div>
      <p className="help tz">Horarios en tu zona: {tz.replace(/_/g, " ")}</p>
      {bookErr && (
        <p className="err" role="alert">
          {bookErr}
        </p>
      )}
      <button type="button" className="btn" disabled={!slot || booking} onClick={confirm}>
        {booking ? "Reservando…" : "Confirmar llamada"}
      </button>
      {state.mock && <p className="notice">Modo demo: horarios de ejemplo, no se reserva en GHL.</p>}
    </div>
  );
}

/* ---------- Sección completa ---------- */

export default function Booking() {
  const [values, setValues] = useState({ q5_freno: [] });
  const [i, setI] = useState(0);
  const [err, setErr] = useState("");
  const [phase, setPhase] = useState("form"); // form | slots | booked | no
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState(null);
  const [booked, setBooked] = useState(null);
  const [mock, setMock] = useState(false);
  const panelRef = useRef(null);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const setValue = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const focusFirst = () =>
    requestAnimationFrame(() => panelRef.current?.querySelector("fieldset input:not(.hp), fieldset textarea")?.focus({ preventScroll: true }));

  const next = async (e) => {
    e.preventDefault();
    const invalid = validateStep(step, values);
    if (invalid) {
      setErr(invalid.msg);
      if (invalid.focus) document.getElementById(invalid.focus)?.focus();
      return;
    }
    setErr("");
    if (!last) {
      setI(i + 1);
      focusFirst();
      return;
    }
    setSending(true);
    const res = await submitLead({ ...values, consent: !!values.consent });
    setSending(false);
    if (!res.ok) {
      const fields = res.data?.fields;
      if (fields) {
        const idx = STEPS.findIndex((s) => s.id === "contact" ? CONTACT_FIELDS.some((f) => fields[f.id]) || fields.consent : fields[s.id]);
        if (idx >= 0) setI(idx);
      }
      setErr(errorMessage(res));
      return;
    }
    setMock(!!res.data.mock);
    if (res.data.qualified && res.data.token) {
      setToken(res.data.token);
      setPhase("slots");
    } else {
      setPhase("no"); // nunca se muestra el calendario
    }
    document.getElementById("agenda")?.scrollIntoView({ block: "start" });
  };

  return (
    <section className="book" id="agenda">
      <div className="wrap">
        <div className="head center">
          <span className="eyebrow">Agenda tu llamada</span>
          <h2>
            Completa tus datos y <em>elige un horario</em>
          </h2>
          <p className="lede">Responde estas preguntas rápidas y reserva tu llamada. Te llevará menos de 1 minuto.</p>
        </div>

        <div className="panel" ref={panelRef}>
          <div className="phases" aria-hidden="true">
            <span className={`ph${phase === "form" || phase === "no" ? " on" : " done"}`}>
              <i>1</i>Tus datos
            </span>
            <span className="sep" />
            <span className={`ph${phase === "slots" || phase === "booked" ? " on" : ""}`}>
              <i>2</i>Día y hora
            </span>
          </div>

          {phase === "form" && (
            <form onSubmit={next} noValidate>
              <div className="progress">
                <span>
                  Paso {i + 1} de {STEPS.length}
                </span>
                <span>{step.name}</span>
              </div>
              <div className="bar">
                <i style={{ width: `${(i / STEPS.length) * 100}%` }} />
              </div>
              {step.id === "contact" ? <ContactStep values={values} setValue={setValue} /> : <QuestionStep q={step.q} value={values[step.id]} setValue={setValue} />}
              {err && (
                <p className="err" role="alert">
                  {err}
                </p>
              )}
              <div className="nav">
                {i > 0 && (
                  <button type="button" className="btn btn-ghost" onClick={() => (setErr(""), setI(i - 1))}>
                    Atrás
                  </button>
                )}
                <button type="submit" className="btn" disabled={sending} style={{ marginLeft: "auto" }}>
                  {sending ? "Enviando…" : last ? "Enviar respuestas" : "Continuar"}
                </button>
              </div>
            </form>
          )}

          {phase === "slots" && (
            <div className="result">
              <span className="eyebrow">Último paso</span>
              <h3>Elige el horario de tu llamada</h3>
              <p className="help">Llamada de 60 minutos con Jaume.</p>
              <SlotPicker
                token={token}
                onBooked={(b) => {
                  setBooked(b);
                  setPhase("booked");
                }}
              />
            </div>
          )}

          {phase === "booked" && booked && (
            <div className="result">
              <span className="eyebrow">Llamada reservada</span>
              <h3>
                Te esperamos el{" "}
                {new Date(booked.startTime).toLocaleString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: booked.tz,
                })}
              </h3>
              <p className="help">Llamada de 60 minutos con Jaume. Te llegará la confirmación por email con los detalles para conectarte.</p>
              {booked.mock && <p className="notice">Modo demo: esta reserva no se creó en GHL.</p>}
            </div>
          )}

          {phase === "no" && (
            <div className="result">
              <span className="eyebrow">Gracias por tus respuestas</span>
              <h3>Ahora mismo la llamada no es el mejor siguiente paso</h3>
              <p className="help">Jaume comparte contenido gratuito sobre cómo hacer que un Airbnb se vea, se elija y se reserve. Empieza por ahí.</p>
              <a className="btn plain" href={CONFIG.instagramUrl} target="_blank" rel="noopener">
                Ver el contenido gratuito
              </a>
              {mock && <p className="notice">Modo demo: estas respuestas no se guardaron en GHL.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
