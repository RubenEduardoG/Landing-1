import { CONFIG } from "../config.js";

export const CTA_TEXT = "Quiero saber más";

/** Etiqueta amarilla para contenido pendiente. Se oculta con VITE_SHOW_PENDING=false. */
export function Pending({ children }) {
  if (!CONFIG.showPending) return null;
  return <span className="pending">{children}</span>;
}

export function Cta({ className = "" }) {
  return (
    <a className={`btn ${className}`} href="#agenda">
      {CTA_TEXT}
    </a>
  );
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
);

export function VideoSlot({ src, poster, pendingLabel, className = "" }) {
  return (
    <div className={`video ${className}`}>
      {src ? (
        <video controls playsInline preload="metadata" poster={poster || undefined} src={src} />
      ) : (
        <div className="slot">
          <div className="play">
            <PlayIcon />
          </div>
          <Pending>{pendingLabel}</Pending>
        </div>
      )}
    </div>
  );
}

export function Stat({ k, v, note }) {
  return (
    <div className="stat">
      <span className="k">{k}</span>
      {v ? (
        <span className="v">{v}</span>
      ) : (
        <>
          <span className="v tbd">Por confirmar</span>
          <Pending>{note || "Pendiente"}</Pending>
        </>
      )}
    </div>
  );
}

export function SectionHead({ eyebrow, title, accent, after = "", lede, center = false }) {
  return (
    <div className={`head${center ? " center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>
        {title}
        {accent && <em>{accent}</em>}
        {after}
      </h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}
