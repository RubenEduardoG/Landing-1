import { useEffect, useRef, useState } from "react";
import { PROOFS } from "../content/proofs.js";
import { SectionHead } from "./ui.jsx";

function ProofCard({ p, onOpen, dup }) {
  return (
    <article className="res proof" aria-hidden={dup || undefined}>
      <button type="button" className="shot" onClick={onOpen} tabIndex={dup ? -1 : undefined} aria-label={`Ampliar: ${p.alt}`}>
        <img src={p.src} alt={dup ? "" : p.alt} loading="lazy" />
      </button>
      <div className="body">
        <span className="who">{p.label}</span>
        <span className="where">{p.note}</span>
      </div>
    </article>
  );
}

function Lightbox({ proof, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!proof) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [proof, onClose]);
  if (!proof) return null;
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="Comprobante ampliado" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <figure>
        <img src={proof.src} alt={proof.alt} />
        <figcaption>
          {proof.label} · {proof.note}
        </figcaption>
      </figure>
      <button type="button" className="lb-close" ref={closeRef} onClick={onClose} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}

/** Cinta infinita: la lista se pinta dos veces y se desplaza -50 % en bucle. */
export default function ProofTape() {
  const [open, setOpen] = useState(null);
  return (
    <section className="band" id="resultados">
      <div className="wrap">
        <SectionHead
          eyebrow="Resultados de clientes"
          title="Resultados de "
          accent="clientes"
          lede="Capturas reales de Airbnb y PriceLabs. Toca una para verla completa."
        />
      </div>
      <div className="tape" aria-label="Comprobantes de resultados">
        <div className="track">
          {[false, true].map((dup) =>
            PROOFS.map((p) => <ProofCard key={`${dup}-${p.src}`} p={p} dup={dup} onOpen={() => setOpen(p)} />)
          )}
        </div>
      </div>
      <Lightbox proof={open} onClose={() => setOpen(null)} />
    </section>
  );
}
