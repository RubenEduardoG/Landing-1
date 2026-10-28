import { CONFIG } from "../config.js";
import { CASES } from "../content/cases.js";
import { Cta, VideoSlot } from "./ui.jsx";

export default function Hero({ ctaRef }) {
  const chips = CASES.filter((c) => c.stats[0].v);
  return (
    <section className="hero" id="inicio">
      <div className="wrap">
        <span className="eyebrow">Acompañamiento 1:1 de 90 días</span>
        <h1>
          Cómo pasar de «mi Airbnb va bien» a facturar <em>hasta un 200&nbsp;% más</em>, sin comprar otra propiedad ni
          reformar.
        </h1>
        <p className="lede">
          Seas propietario o gestor de propiedades, siempre es lo mismo: una pieza rota que nadie mira ni te enseña.
        </p>
        <VideoSlot src={CONFIG.vslUrl} poster={CONFIG.vslPoster} pendingLabel="VSL pendiente de entrega" />
        <span ref={ctaRef}>
          <Cta />
        </span>
        <div className="trust">
          <div className="chips">
            {chips.map((c) => (
              <div className="chip" key={c.id}>
                <b>{c.name}</b>
                <span>{c.stats[c.stats.length - 1].v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
