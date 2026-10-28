import { useRef } from "react";
import Booking from "./components/Booking.jsx";
import Footer, { Header } from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import MoreResults from "./components/MoreResults.jsx";
import Program from "./components/Program.jsx";
import ProofTape from "./components/ProofTape.jsx";
import StickyCta from "./components/StickyCta.jsx";
import Testimonials from "./components/Testimonials.jsx";
import { CONFIG } from "./config.js";

// Orden aprobado: Hero/VSL → Resultados → Testimonios → Programa → Más resultados → Agenda.
export default function App() {
  const heroCta = useRef(null);
  return (
    <div className={CONFIG.showPending ? undefined : "no-pending"}>
      <Header />
      <main>
        <Hero ctaRef={heroCta} />
        <ProofTape />
        <Testimonials />
        <Program />
        <MoreResults />
        <Booking />
      </main>
      <Footer />
      <StickyCta heroCtaRef={heroCta} />
    </div>
  );
}
