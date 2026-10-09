import { fmtFecha, NO_PRUEBA, PESO } from "@/lib/motor";
import type { Constancia as C } from "@/lib/types";

const ORIGEN: Record<C["origen"], string> = {
  pagado: "Trabajo pagado por quien lo necesitaba",
  jcf: "Trabajo dentro de Jóvenes Construyendo el Futuro",
};

function dias(desde: string, hasta: string): number {
  const d = (new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000;
  return Math.max(1, Math.round(d) + 1);
}

/* Persona test: la reclutadora tiene 40 segundos. Lo que decide va arriba
   (quién, qué hizo, quién lo vio y firma, cuánto duró). El detalle y los
   límites van después, sin esconderse. */
export default function Constancia({ c, autentica }: { c: C; autentica: boolean | null }) {
  const peso = PESO[c.centro.tipo];
  const d = dias(c.bitacora.desde, c.bitacora.hasta);
  return (
    <article className="constancia" aria-label={`Constancia ${c.codigo}`}>
      <div className="encab">
        <div>
          <p className="tit">Constancia de prueba viva</p>
          <p className="cod">Folio {c.codigo} · emitida el {fmtFecha(c.emitida)}</p>
        </div>
      </div>

      <div className={`sello-circ${autentica === false ? " falso" : ""}`} aria-hidden="true">
        {autentica === false ? "SELLO NO VÁLIDO" : autentica ? "SELLO VERIFICADO · PRUEBA VIVA" : "SELLADA POR PRUEBA VIVA"}
      </div>

      <p className="grande" style={{ fontSize: 28 }}>{c.alias}</p>
      <p style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{c.encargo}</p>
      <p className="cod">{ORIGEN[c.origen]} · {c.centro.nombre} · {d} {d === 1 ? "día" : "días"}, {c.bitacora.entradas} registros en bitácora</p>

      <div className="resumen-firma">
        <p className="cod">Lo vio y firma</p>
        <p style={{ fontWeight: 800, fontSize: 18 }}>{c.tutor.nombre}</p>
        <p>{c.tutor.cargo} · {c.centro.nombre}</p>
        <p className="cita">“{c.nota}”</p>
      </div>

      <h3>Lo que el tutor vio · criterios oficiales {c.estandar.codigo}</h3>
      <ul>
        {c.vistos.map((v) => <li key={v.id}>{v.texto} <span className="cod">{v.id}</span></li>)}
      </ul>

      {c.noVistos.length > 0 && (
        <>
          <h3>No se observó en este encargo</h3>
          <ul>
            {c.noVistos.map((v) => <li key={v.id}>{v.texto} <span className="cod">{v.id}</span></li>)}
          </ul>
        </>
      )}

      <h3>Para qué se hizo</h3>
      <p>{c.quienLoNecesitaba}</p>

      <h3>Cómo se comprobó</h3>
      <p>
        Bitácora del {fmtFecha(c.bitacora.desde)} al {fmtFecha(c.bitacora.hasta)}
        {c.bitacora.conIA > 0 ? `. Declaró en ${c.bitacora.conIA} ${c.bitacora.conIA === 1 ? "registro" : "registros"} que usó IA y para qué, como pide la regla.` : ". Declaró no usar IA."}
      </p>
      <p>
        Defensa en vivo de {c.defensa.preguntas} preguntas
        {c.defensa.fuente === "gemini" ? " sugeridas por IA (Gemini)" : " sugeridas por plantilla automática (modo sin IA)"}, escuchada por el tutor. La IA no calificó.
      </p>
      <p className="cod">
        Estándar: {c.estandar.titulo} (CONOCER, DOF {c.estandar.dof}). Respaldo de la firma: {peso.etiqueta.toLowerCase()}, declarado por el tutor.
      </p>

      <details className="no-prueba">
        <summary><b>Lo que esta constancia no prueba</b></summary>
        <ul>
          {NO_PRUEBA.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </details>
    </article>
  );
}
