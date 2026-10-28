import { PROGRAM, PROGRAM_HEAD } from "../content/program.js";
import { Cta, Pending, SectionHead } from "./ui.jsx";

function ProgramCard({ p, i }) {
  return (
    <article className="card">
      <div className="art">
        {p.img ? (
          <img src={p.img} alt="" loading="lazy" />
        ) : (
          <>
            <span className="big">{p.mark}</span>
            <Pending>Imagen pendiente{p.imgIdea ? `: ${p.imgIdea}` : ""}</Pending>
          </>
        )}
      </div>
      <div className="txt">
        <span className="num">{i + 1}</span>
        <h3>{p.t}</h3>
        <p>{p.d}</p>
      </div>
    </article>
  );
}

export default function Program() {
  return (
    <section className="band" id="programa">
      <div className="wrap">
        <SectionHead eyebrow={PROGRAM_HEAD.eyebrow} title="Todo lo que " accent="recibes" lede={PROGRAM_HEAD.subtitle} center />
        <div className="program">
          {PROGRAM.map((p, i) => (
            <ProgramCard key={p.t} p={p} i={i} />
          ))}
        </div>
        <div className="cta-row">
          <Cta />
        </div>
      </div>
    </section>
  );
}
