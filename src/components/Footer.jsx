import { CONFIG } from "../config.js";
import { Pending } from "./ui.jsx";

export function Header() {
  return (
    <header className="top">
      <div className="wrap">
        <div className="mark">
          BNB<b>390</b>
        </div>
        <small>con Jaume Genovard</small>
      </div>
    </header>
  );
}

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="mark">
          BNB<b>390</b>
        </div>
        <p>
          Los resultados mostrados son casos particulares aportados por sus protagonistas. No constituyen una garantía de
          resultados futuros, que dependen de cada propiedad, mercado e implementación.
        </p>
        <p>
          {CONFIG.privacyUrl ? (
            <a href={CONFIG.privacyUrl} target="_blank" rel="noopener">
              Política de privacidad
            </a>
          ) : (
            <>
              Política de privacidad <Pending>Pendiente</Pending>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
