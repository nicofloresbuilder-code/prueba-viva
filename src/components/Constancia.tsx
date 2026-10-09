import { fmtFecha, NO_PRUEBA, PESO } from "@/lib/motor";
import type { Constancia as C } from "@/lib/types";

const ORIGEN: Record<C["origen"], string> = {
  pagado: "Trabajo pagado por quien lo necesitaba",
  jcf: "Trabajo dentro de Jóvenes Construyendo el Futuro",
};

export default function Constancia({ c, autentica }: { c: C; autentica: boolean | null }) {
  const peso = PESO[c.centro.tipo];
  return (
    <article className="constancia" aria-label={`Constancia ${c.codigo}`}>
      <div className="encab">
        <div>
          <p className="tit">Constancia de prueba viva</p>
          <p className="cod">Emitida el {fmtFecha(c.emitida)}</p>
        </div>
        <p className="codigo">{c.codigo}</p>
      </div>

      <div className={`sello-circ${autentica === false ? " falso" : ""}`} aria-hidden="true">
        {autentica === false ? "SELLO NO VÁLIDO" : autentica ? "SELLO VERIFICADO · PRUEBA VIVA" : "SELLADA POR PRUEBA VIVA"}
      </div>

      <h3>Quién trabajó</h3>
      <p className="grande">{c.alias}</p>

      <h3>Qué hizo</h3>
      <p><b>{c.encargo}</b></p>
      <p>{c.quienLoNecesitaba}</p>
      <p className="cod">{ORIGEN[c.origen]} · {c.centro.nombre}</p>

      <h3>Criterios que el tutor vio · {c.estandar.codigo}</h3>
      <p className="cod">{c.estandar.titulo} (CONOCER, DOF {c.estandar.dof})</p>
      <ul>
        {c.vistos.map((v) => (
          <li key={v.id}><span className="cod">{v.id}</span> {v.texto}</li>
        ))}
      </ul>

      {c.noVistos.length > 0 && (
        <>
          <h3>Criterios que el tutor NO vio</h3>
          <ul>
            {c.noVistos.map((v) => (
              <li key={v.id}><span className="cod">{v.id}</span> {v.texto}</li>
            ))}
          </ul>
        </>
      )}

      <h3>Cómo se comprobó</h3>
      <p>
        Bitácora de {c.bitacora.entradas} entradas, del {fmtFecha(c.bitacora.desde)} al {fmtFecha(c.bitacora.hasta)}
        {c.bitacora.conIA > 0 ? `; en ${c.bitacora.conIA} declaró que usó IA y para qué` : "; declaró no usar IA"}.
      </p>
      <p>
        Defensa en vivo de {c.defensa.preguntas} preguntas
        {c.defensa.fuente === "gemini" ? " propuestas por IA (Gemini)" : " propuestas por el generador simulado"}, escuchada por el tutor.
      </p>

      <h3>Firma</h3>
      <p className="grande">{c.tutor.nombre}</p>
      <p>{c.tutor.cargo} · {c.centro.nombre}</p>
      <p>“{c.nota}”</p>
      <p className="cod">Respaldo de la firma: {peso.etiqueta} — {peso.detalle}</p>

      <div className="no-prueba">
        <b>Lo que esta constancia no prueba</b>
        <ul>
          {NO_PRUEBA.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </div>
    </article>
  );
}
