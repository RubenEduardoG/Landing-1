import { CASES } from "../content/cases.js";
import { Cta, Pending, SectionHead, Stat, VideoSlot } from "./ui.jsx";

function TestimonialCard({ c }) {
  return (
    <article className="testi">
      <VideoSlot src={c.video} pendingLabel="Video pendiente de asociar" />
      <div className="txt">
        <div style={{ display: "grid", gap: 8 }}>
          <p className="meta">
            <strong>{c.name}</strong>
            {c.place && ` · ${c.place}`}
            <small>{c.profile}</small>
          </p>
          {c.headline ? <h3>{c.headline}</h3> : <Pending>{c.headlineNote || "Titular pendiente"}</Pending>}
        </div>
        <p>{c.text}</p>
        <div className="stats">
          {c.stats.map((s) => (
            <Stat key={s.k} {...s} />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonios">
      <div className="wrap">
        <SectionHead eyebrow="Testimonios" title="¿Qué opinan los " accent="clientes" after="?" center />
        <div className="testis">
          {CASES.map((c) => (
            <TestimonialCard key={c.id} c={c} />
          ))}
        </div>
        <div className="cta-row">
          <Cta />
        </div>
      </div>
    </section>
  );
}
