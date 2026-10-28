import { MORE_CAPTURES } from "../content/proofs.js";

/** Sección 5: solo aparece si hay capturas extra en MORE_CAPTURES. */
export default function MoreResults() {
  if (!MORE_CAPTURES.length) return null;
  return (
    <section id="mas-resultados">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Más resultados de clientes</span>
        </div>
        <div className="masonry">
          {MORE_CAPTURES.map((m) => (
            <img key={m.src} src={m.src} alt={m.alt || ""} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
