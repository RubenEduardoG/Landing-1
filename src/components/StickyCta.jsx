import { useEffect, useState } from "react";
import { Cta } from "./ui.jsx";

/** CTA fijo en móvil: aparece tras el botón del hero y se oculta dentro de la sección de agenda. */
export default function StickyCta({ heroCtaRef }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !heroCtaRef.current) return;
    let pastHero = false;
    let inBook = false;
    const upd = () => setOn(pastHero && !inBook);
    const o1 = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      upd();
    });
    const o2 = new IntersectionObserver(([e]) => {
      inBook = e.isIntersecting;
      upd();
    });
    o1.observe(heroCtaRef.current);
    const book = document.getElementById("agenda");
    if (book) o2.observe(book);
    return () => {
      o1.disconnect();
      o2.disconnect();
    };
  }, [heroCtaRef]);
  return (
    <div className={`sticky${on ? " on" : ""}`} aria-hidden={!on}>
      <Cta />
    </div>
  );
}
