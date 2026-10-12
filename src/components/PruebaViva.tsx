"use client";

import { useEffect, useMemo, useState } from "react";
import Constancia from "./Constancia";
import { BITACORA_DEMO, ENCARGO_DEMO, NOTAS_DEMO, PARTICIPANTE_DEMO, puenteDemo } from "@/lib/demo";
import PasoPuente from "./PasoPuente";
import { Campo, Errores } from "./campos";
import { criterio, ESTANDARES, estandar } from "@/lib/estandares";
import {
  defensaCompleta, fmtFecha, fmtHora, LIM, listoParaDefensa, MARCAS, MOTIVO_PRACTICA, notaParaIA, PESO,
  FUENTE_EVIDENCIA, respondidas, validarEncargo, validarEntrada, validarFirma, validarParticipante,
} from "@/lib/motor";
import type { Constancia as TConstancia, Defensa, Encargo, EntradaBitacora, Firma, FuenteEvidencia, FuenteIA, Marca, Participante, Puente, TipoCentro } from "@/lib/types";

/* ───────────── Estado ───────────── */

export interface Estado {
  encargo: Encargo;
  encargoGuardado: boolean;
  bitacora: EntradaBitacora[];
  defensa: Defensa | null;
  firma: Firma;
  emitida: { constancia: TConstancia; fragmento: string } | null;
  participante: Participante;
  puente: Puente | null;
  demo: boolean;
}

const VACIO: Estado = {
  encargo: {
    titulo: "", quienLoNecesitaba: "", origen: "jcf", centroNombre: "", centroTipo: "jcf", estandar: "EC0305",
    criterios: [], alias: "", tutorNombre: "", tutorCargo: "",
    pago: "", alcance: "", rutaDisputa: "", rutaReal: "no-se", mostradoAntes: false, creado: "",
  },
  encargoGuardado: false,
  bitacora: [],
  defensa: null,
  firma: { nombreCompleto: "", cargo: "", vistos: {}, nota: "" },
  emitida: null,
  participante: { consiente: false, iaPermitida: false, vioCondiciones: false, consentidoEn: "", previas: [] },
  puente: null,
  demo: false,
};

const LLAVE = "prueba-viva-v1";
export type Paso = 1 | 2 | 3 | 4 | 5;

/* ───────────── Componente principal ───────────── */

export default function PruebaViva() {
  const [s, setS] = useState<Estado>(VACIO);
  const [cargado, setCargado] = useState(false);
  const [paso, setPaso] = useState<Paso>(1);
  const [servidor, setServidor] = useState<{ ia: FuenteIA; sello: boolean } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LLAVE);
      if (raw) {
        const g = JSON.parse(raw) as Estado;
        // Hidratar desde localStorage solo puede pasar después de montar (no existe en el servidor).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setS({ ...VACIO, ...g });
        setPaso(g.puente ? 5 : g.emitida ? 4 : g.defensa ? 3 : g.encargoGuardado ? 2 : 1);
      }
    } catch { /* sin almacenamiento: se trabaja en memoria */ }
    setCargado(true);
    fetch("/api/estado").then((r) => r.json()).then(setServidor).catch(() => setServidor({ ia: "simulado", sello: false }));
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try { localStorage.setItem(LLAVE, JSON.stringify(s)); } catch { /* ignorar */ }
  }, [s, cargado]);

  const listoBitacora = listoParaDefensa(s.bitacora);
  const listoDefensa = defensaCompleta(s.defensa);
  const habilitado: Record<Paso, boolean> = {
    1: true,
    2: s.encargoGuardado,
    3: s.encargoGuardado && listoBitacora,
    4: s.encargoGuardado && listoBitacora && listoDefensa,
    5: Boolean(s.emitida),
  };

  const cargarDemo = () => {
    setS({ ...VACIO, encargo: ENCARGO_DEMO, encargoGuardado: true, bitacora: BITACORA_DEMO, participante: PARTICIPANTE_DEMO, demo: true });
    setPaso(3);
  };

  return (
    <div className="envoltura">
      <header className="cabecera">
        <div>
          <h1 className="marca">Prueba<br /><span>Viva</span></h1>
          <div className="estado">
            {servidor && (
              <span className={`chip ${servidor.ia === "gemini" ? "ok" : "sim"}`}>
                {servidor.ia === "gemini" ? "Preguntas con IA (Gemini)" : "Preguntas en modo sin IA (simulado)"}
              </span>
            )}
            {servidor && !servidor.sello && <span className="chip sim">Constancias aún no disponibles</span>}
            <span className="chip">Módulo de prueba de PUENTE MX</span>
          </div>
        </div>
        <p className="lema">
          Una prueba que la IA no puede hacer por ti: trabajo real, una bitácora de cómo lo hiciste, y una defensa en vivo
          frente a quien te supervisó. Esa persona firma.
        </p>
      </header>

      {s.demo && (
        <p className="aviso-demo">
          <b>EJEMPLO</b> La ferretería, el tutor y el joven son inventados. Puedes recorrer el flujo completo con ellos.
        </p>
      )}

      <nav className="pasos" aria-label="Pasos">
        {([
          [1, "Encargo", "Lo llena el tutor", s.encargoGuardado],
          [2, "Bitácora", "Lo llena el joven", listoBitacora],
          [3, "Defensa", "Juntos, en vivo", listoDefensa],
          [4, "Firma", "Firma el tutor", Boolean(s.emitida)],
          [5, "Siguiente paso", "Coordinadora", Boolean(s.puente?.guardado)],
        ] as [Paso, string, string, boolean][]).map(([n, t, q, hecho]) => (
          <button key={n} className="paso" aria-current={paso === n ? "step" : undefined} disabled={!habilitado[n]} onClick={() => setPaso(n)}>
            <span className="n">0{n}{hecho && <span className="hecho">✓ listo</span>}</span>
            <span className="t">{t}</span>
            <span className="q">{q}</span>
          </button>
        ))}
      </nav>

      <section className="panel">
        {paso === 1 && <PasoEncargo s={s} setS={setS} irA={setPaso} cargarDemo={cargarDemo} />}
        {paso === 2 && <PasoBitacora s={s} setS={setS} irA={setPaso} />}
        {paso === 3 && <PasoDefensa s={s} setS={setS} irA={setPaso} />}
        {paso === 4 && <PasoFirma s={s} setS={setS} irA={setPaso} selloActivo={servidor?.sello ?? false} />}
        {paso === 5 && <PasoPuente s={s} setS={setS} demoPuente={puenteDemo} />}
      </section>

      <Reiniciar onReiniciar={() => { setS(VACIO); setPaso(1); }} />

      <footer className="pie">
        <p>
          Los criterios vienen de Estándares de Competencia de CONOCER publicados en el DOF (EC0305 y EC0254). Esta app no
          emite certificaciones oficiales.
        </p>
        <p>
          Todo lo que escribes se queda en este navegador. El servidor solo recibe los datos cuando pides preguntas a la IA o
          sellas la constancia, y no guarda nada.
        </p>
      </footer>
    </div>
  );
}

function Reiniciar({ onReiniciar }: { onReiniciar: () => void }) {
  const [seguro, setSeguro] = useState(false);
  return (
    <div className="botones no-imprimir">
      {!seguro ? (
        <button className="btn-texto" onClick={() => setSeguro(true)}>Empezar de nuevo</button>
      ) : (
        <>
          <span>¿Borrar todo lo de este navegador?</span>
          <button className="btn claro" onClick={() => { onReiniciar(); setSeguro(false); }}>Sí, borrar</button>
          <button className="btn-texto" onClick={() => setSeguro(false)}>Cancelar</button>
        </>
      )}
    </div>
  );
}

type Props = { s: Estado; setS: React.Dispatch<React.SetStateAction<Estado>>; irA: (p: Paso) => void };

/* ───────────── 01 · Encargo ───────────── */

function PasoEncargo({ s, setS, irA, cargarDemo }: Props & { cargarDemo: () => void }) {
  const e = s.encargo;
  const [errores, setErrores] = useState<string[]>([]);
  const bloqueado = Boolean(s.defensa);
  const set = <K extends keyof Encargo>(k: K, v: Encargo[K]) =>
    setS((x) => ({ ...x, encargo: { ...x.encargo, [k]: v }, encargoGuardado: false }));
  const est = estandar(e.estandar);

  const toggle = (id: string) => {
    const tiene = e.criterios.includes(id);
    if (!tiene && e.criterios.length >= LIM.criteriosMax) return;
    set("criterios", tiene ? e.criterios.filter((c) => c !== id) : [...e.criterios, id]);
  };

  const guardar = () => {
    const err = validarEncargo(e);
    setErrores(err);
    if (err.length) return;
    setS((x) => ({ ...x, encargo: { ...x.encargo, creado: x.encargo.creado || new Date().toISOString() }, encargoGuardado: true }));
    irA(2);
  };

  return (
    <>
      <p className="quien">Lo llena el tutor</p>
      <h2>01 · El encargo</h2>
      <p className="intro">
        Un trabajo real y corto que alguien necesitaba, ligado a criterios oficiales. La constancia solo dirá lo que este
        encargo permitió ver.
      </p>

      {!s.encargoGuardado && !e.titulo && (
        <div className="botones" style={{ marginTop: 0, marginBottom: 18 }}>
          <button className="btn claro" onClick={cargarDemo}>Ver con el ejemplo inventado</button>
        </div>
      )}

      {bloqueado && (
        <p className="exito">El encargo quedó fijo porque ya empezó la defensa. Para cambiarlo, empieza de nuevo.</p>
      )}

      <fieldset disabled={bloqueado} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="campos">
          <Campo id="titulo" label="¿Qué trabajo se hizo?" ancho lim={LIM.titulo} valor={e.titulo} onChange={(v) => set("titulo", v)}
            placeholder="Ej. Ordenar y contestar los pedidos de WhatsApp durante una semana" />
          <Campo id="quien" label="¿Quién lo necesitaba y para qué?" area ancho lim={LIM.quien} valor={e.quienLoNecesitaba}
            onChange={(v) => set("quienLoNecesitaba", v)} ayuda="Si nadie lo necesitaba de verdad, no es prueba." />

          <div className="campo ancho">
            <span className="etiqueta">¿De dónde salió el trabajo?</span>
            <div className="opciones" role="radiogroup">
              {([["jcf", "Dentro de Jóvenes Construyendo el Futuro"], ["pagado", "Trabajo pagado"], ["practica", "Fue una práctica"]] as const).map(([v, t]) => (
                <label key={v} className={`opcion${e.origen === v ? " activa" : ""}`}>
                  <input type="radio" name="origen" checked={e.origen === v} onChange={() => set("origen", v)} /> {t}
                </label>
              ))}
            </div>
            {e.origen === "practica" && <p className="rechazo">{MOTIVO_PRACTICA}</p>}
          </div>

          <Campo id="centro" label="Centro de trabajo" lim={LIM.centro} valor={e.centroNombre} onChange={(v) => set("centroNombre", v)} placeholder="Ej. Ferretería La Esperanza" />
          <div className="campo">
            <label htmlFor="tipo">¿Qué tipo de centro es?</label>
            <select id="tipo" value={e.centroTipo} onChange={(ev) => set("centroTipo", ev.target.value as TipoCentro)}>
              {(Object.keys(PESO) as TipoCentro[]).map((k) => <option key={k} value={k}>{PESO[k].etiqueta}</option>)}
            </select>
            <p className="ayuda">Es declarado: la constancia lo dirá así, sin fingir que se verificó.</p>
          </div>

          <div className="campo ancho">
            <span className="etiqueta">¿A qué se parece más este trabajo?</span>
            <div className="estandares" role="radiogroup">
              {ESTANDARES.map((x) => (
                <label key={x.codigo} className={`estandar-op${e.estandar === x.codigo ? " activa" : ""}`}>
                  <input type="radio" name="estandar" checked={e.estandar === x.codigo}
                    onChange={() => setS((y) => ({ ...y, encargo: { ...y.encargo, estandar: x.codigo, criterios: [] }, encargoGuardado: false }))} />
                  <span>{x.titulo}<small>Criterios oficiales de CONOCER · {x.codigo}</small></span>
                </label>
              ))}
            </div>
            <p className="ayuda" style={{ marginTop: 8 }}>
              Palomea lo que vas a poder ver con tus propios ojos mientras el joven trabaja: de 2 a 6 ({e.criterios.length} elegidos).
            </p>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          {est?.elementos.map((el) => (
            <div key={el.codigo} className="grupo-criterios">
              <h4><code>{el.codigo}</code>{el.nombre}</h4>
              {el.criterios.map((c) => (
                <label key={c.id} className="criterio">
                  <input type="checkbox" checked={e.criterios.includes(c.id)} onChange={() => toggle(c.id)}
                    disabled={!e.criterios.includes(c.id) && e.criterios.length >= LIM.criteriosMax} />
                  <span>{c.texto} <code>{c.id}</code></span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="campos" style={{ marginTop: 16 }}>
          <Campo id="alias" label="¿Cómo aparece el joven en la constancia?" lim={LIM.alias} valor={e.alias} onChange={(v) => set("alias", v)}
            ayuda="Nombre y una inicial basta. Lo decide el joven." placeholder="Ej. Dany R." />
          <Campo id="tutor" label="Nombre y apellido del tutor" lim={[3, 80]} valor={e.tutorNombre} onChange={(v) => set("tutorNombre", v)} placeholder="Ej. Rogelio Martínez" />
          <Campo id="cargo" label="Cargo del tutor" lim={LIM.cargo} valor={e.tutorCargo} onChange={(v) => set("tutorCargo", v)} placeholder="Ej. Encargado de mostrador" />
        </div>

        <div className="antes">
          <h3>Antes de empezar, el joven tiene que ver esto</h3>
          <p className="ayuda">Sin pago no hay encargo: un trabajo gratis &ldquo;a cambio de experiencia&rdquo; no se pasa como oportunidad.</p>
          <div className="campos">
            <Campo id="pago" label="¿Cuánto se paga y quién lo paga?" area ancho lim={LIM.pago} valor={e.pago} onChange={(v) => set("pago", v)}
              placeholder="Ej. $1,500 por la semana, los paga la ferretería / beca mensual de JCF" />
            <Campo id="alcance" label="Alcance: qué entra, qué no y cuánto dura" area ancho lim={LIM.alcance} valor={e.alcance} onChange={(v) => set("alcance", v)} />
            <Campo id="disputa" label="Si no está de acuerdo con la revisión o el pago, ¿con quién lo habla?" area ancho lim={LIM.disputa} valor={e.rutaDisputa} onChange={(v) => set("rutaDisputa", v)}
              ayuda="Además de esto, el joven siempre puede escribir a la coordinación de PUENTE MX, y el tutor no ve su queja." />
            <div className="campo ancho">
              <span className="etiqueta">Después de este encargo, ¿hay un puesto o una oportunidad pagada real?</span>
              <div className="opciones" role="radiogroup">
                {([["verificada", "Sí, y lo puedo comprobar"], ["no", "No"], ["no-se", "No sé todavía"]] as const).map(([v, t]) => (
                  <label key={v} className={`opcion${e.rutaReal === v ? " activa" : ""}`}>
                    <input type="radio" name="rutaReal" checked={e.rutaReal === v} onChange={() => set("rutaReal", v)} /> {t}
                  </label>
                ))}
              </div>
              <p className="ayuda">Si la respuesta es &ldquo;no&rdquo; o &ldquo;no sé&rdquo;, se le dice así al joven. No se promete un empleo que no existe.</p>
            </div>
          </div>
          <label className="juramento">
            <input type="checkbox" checked={e.mostradoAntes} onChange={(ev) => set("mostradoAntes", ev.target.checked)} />
            <span>Le mostré al joven el pago, el alcance, los criterios con los que se revisa y con quién reclamar, antes de que empezara.</span>
          </label>
        </div>
      </fieldset>

      <Errores lista={errores} />
      {!bloqueado && (
        <div className="botones">
          <button className="btn" onClick={guardar} disabled={e.origen === "practica"}>Guardar encargo</button>
        </div>
      )}
      {s.encargoGuardado && bloqueado && (
        <div className="botones"><button className="btn claro" onClick={() => irA(2)}>Ir a la bitácora</button></div>
      )}
    </>
  );
}

/* ───────────── 02 · Bitácora ───────────── */

function PasoBitacora({ s, setS, irA }: Props) {
  const [que, setQue] = useState("");
  const [decision, setDecision] = useState("");
  const [usoIA, setUsoIA] = useState(false);
  const [paraQue, setParaQue] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const bloqueada = Boolean(s.defensa);
  const n = s.bitacora.length;

  const agregar = () => {
    const en = { que, decision, usoIA, paraQueIA: usoIA ? paraQue : "" };
    const err = validarEntrada(en);
    setErrores(err);
    if (err.length) return;
    if (n >= LIM.entradasMax) { setErrores(["La bitácora llegó al máximo de 30 entradas."]); return; }
    setS((x) => ({ ...x, bitacora: [...x.bitacora, { id: `b${Date.now()}`, t: new Date().toISOString(), ...en }] }));
    setQue(""); setDecision(""); setUsoIA(false); setParaQue("");
  };

  return (
    <>
      <p className="quien">Lo llena el joven</p>
      <h2>02 · La bitácora</h2>
      <p className="intro">
        Anota mientras trabajas: qué hiciste y, sobre todo, qué decidiste y por qué. Si usaste IA, dilo y di para qué.
        Usarla no te descalifica; esconderla sí.
      </p>
      <Consentimiento s={s} setS={setS} bloqueado={bloqueada || n > 0} />

      <p className="progreso">{n >= LIM.entradasMin ? `${n} entradas (mínimo ${LIM.entradasMin}) ✓ lista para la defensa` : `${n} de ${LIM.entradasMin} entradas mínimas`}</p>

      {n > 0 && (
        <ol className="linea-tiempo">
          {s.bitacora.map((b) => (
            <li key={b.id} className="entrada">
              <span className="hora">{fmtFecha(b.t)} · {fmtHora(b.t)}</span>
              <p>{b.que}</p>
              <p className="dec">Decisión: {b.decision}</p>
              {b.usoIA && <span className="ia-uso">Usé IA para: {b.paraQueIA}</span>}
              {!bloqueada && (
                <div><button className="btn-texto" onClick={() => setS((x) => ({ ...x, bitacora: x.bitacora.filter((y) => y.id !== b.id) }))}>Quitar</button></div>
              )}
            </li>
          ))}
        </ol>
      )}

      {bloqueada ? (
        <p className="exito">La bitácora quedó fija porque ya empezó la defensa.</p>
      ) : !(s.participante.consiente && s.participante.vioCondiciones) ? (
        <p className="errores">Para escribir en la bitácora, primero confirma arriba que viste las condiciones y que tu tutor puede leerla.</p>
      ) : (
        <div className="nueva">
          <h3>Nueva entrada · {fmtHora(new Date().toISOString())}</h3>
          <div className="campos">
            <Campo id="que" label="¿Qué hiciste?" area ancho lim={LIM.que} valor={que} onChange={setQue} placeholder="Ej. Revisé los chats de la semana y conté cuántos pedidos no se contestaron." />
            <Campo id="decision" label="¿Qué decidiste y por qué?" area ancho lim={LIM.decision} valor={decision} onChange={setDecision} placeholder="Ej. Empecé por los que no tenían respuesta porque eran clientes esperando." />
            <label className="juramento campo ancho" style={{ marginTop: 0 }}>
              <input type="checkbox" checked={usoIA} onChange={(ev) => setUsoIA(ev.target.checked)} />
              <span>Usé IA en esta parte</span>
            </label>
            {usoIA && <Campo id="paraque" label="¿Para qué la usaste y qué le cambiaste?" ancho lim={LIM.paraQue} valor={paraQue} onChange={setParaQue} />}
          </div>
          <Errores lista={errores} />
          <div className="botones"><button className="btn" onClick={agregar}>Agregar a la bitácora</button></div>
        </div>
      )}

      <div className="botones">
        <button className="btn claro" onClick={() => irA(3)} disabled={!listoParaDefensa(s.bitacora)}>Ir a la defensa</button>
      </div>
    </>
  );
}

function Consentimiento({ s, setS, bloqueado }: Omit<Props, "irA"> & { bloqueado: boolean }) {
  const p = s.participante;
  const [tarea, setTarea] = useState("");
  const [fuente, setFuente] = useState<FuenteEvidencia>("autodeclarada");
  const [err, setErr] = useState<string[]>([]);
  const setP = (q: Participante) => setS((x) => ({ ...x, participante: q }));
  const agregar = () => {
    const nueva = { id: `x${Date.now()}`, tarea, fuente, informal: true };
    const e = validarParticipante({ ...p, previas: [...p.previas, nueva] });
    setErr(e);
    if (e.length) return;
    setP({ ...p, previas: [...p.previas, nueva] });
    setTarea("");
  };
  return (
    <div className="antes" style={{ marginTop: 0, marginBottom: 18 }}>
      <h3>Antes de empezar</h3>
      <div className="condiciones">
        <p><b>Te pagan:</b> {s.encargo.pago}</p>
        <p><b>Qué entra y qué no:</b> {s.encargo.alcance}</p>
        <p><b>Si no estás de acuerdo:</b> {s.encargo.rutaDisputa} También puedes escribir a la coordinación de PUENTE MX; tu tutor no ve tu queja.</p>
      </div>
      <label className="juramento">
        <input type="checkbox" checked={p.vioCondiciones} disabled={bloqueado}
          onChange={(ev) => setP({ ...p, vioCondiciones: ev.target.checked })} />
        <span>Vi cuánto me pagan, qué entra en el trabajo y a quién reclamar.</span>
      </label>
      <label className="juramento">
        <input type="checkbox" checked={p.consiente} disabled={bloqueado}
          onChange={(ev) => setP({ ...p, consiente: ev.target.checked, consentidoEn: ev.target.checked ? new Date().toISOString() : "" })} />
        <span>Mi tutor puede leer mi bitácora. <span className="ayuda">(Obligatorio: sin esto no hay defensa.)</span></span>
      </label>
      <label className="juramento">
        <input type="checkbox" checked={p.iaPermitida} disabled={Boolean(s.defensa)}
          onChange={(ev) => setP({ ...p, iaPermitida: ev.target.checked })} />
        <span>La IA puede leer mi bitácora para proponer las preguntas. <span className="ayuda">(Opcional: si dices que no, las preguntas salen de una plantilla y nada se manda al modelo.)</span></span>
      </label>
      <p className="ayuda" style={{ marginTop: 8 }}>La bitácora no sale de este dispositivo. La constancia la mandas tú.</p>
      <details style={{ marginTop: 12 }}>
        <summary className="etiqueta" style={{ cursor: "pointer" }}>Opcional: trabajo que ya hiciste antes, también informal ({p.previas.length})</summary>
        <p className="ayuda" style={{ marginTop: 6 }}>Cuenta aunque no haya sido un empleo. Saldrá como &ldquo;no verificado&rdquo; hasta que alguien lo revise.</p>
        {p.previas.map((x) => (
          <p key={x.id} className="previa">
            {x.tarea} <span className="cod">· {FUENTE_EVIDENCIA[x.fuente].etiqueta}</span>{" "}
            <button className="btn-texto" onClick={() => setP({ ...p, previas: p.previas.filter((y) => y.id !== x.id) })}>Quitar</button>
          </p>
        ))}
        {p.previas.length < LIM.previasMax && (
          <div className="campos" style={{ marginTop: 8 }}>
            <Campo id="previa" label="¿Qué hiciste?" ancho lim={LIM.previa} valor={tarea} onChange={setTarea} placeholder="Ej. Llevé las cuentas del puesto de mi tía los fines de semana" />
            <div className="campo">
              <label htmlFor="fuente">¿Cómo se puede comprobar?</label>
              <select id="fuente" value={fuente} onChange={(ev) => setFuente(ev.target.value as FuenteEvidencia)}>
                {(Object.keys(FUENTE_EVIDENCIA) as FuenteEvidencia[]).map((k) => <option key={k} value={k}>{FUENTE_EVIDENCIA[k].etiqueta}</option>)}
              </select>
            </div>
            <div className="campo" style={{ justifyContent: "flex-end" }}><button className="btn claro" onClick={agregar}>Agregar</button></div>
          </div>
        )}
        <Errores lista={err} />
      </details>
    </div>
  );
}

/* ───────────── 03 · Defensa ───────────── */

function PasoDefensa({ s, setS, irA }: Props) {
  const [cargando, setCargando] = useState<"preguntas" | "alertas" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const d = s.defensa;

  const cuerpo = useMemo(() => ({
    sinIA: !s.participante.iaPermitida,
    encargo: s.encargo.titulo,
    criterios: s.encargo.criterios,
    bitacora: s.bitacora.map(({ t, que, decision, usoIA, paraQueIA }) => ({ t, que, decision, usoIA, paraQueIA })),
  }), [s.encargo, s.bitacora, s.participante.iaPermitida]);

  const pedirPreguntas = async () => {
    setCargando("preguntas"); setError(null);
    try {
      const r = await fetch("/api/preguntas", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudieron generar las preguntas.");
      setS((x) => ({ ...x, defensa: { preguntas: j.preguntas, fuente: j.fuente, generadas: new Date().toISOString(), notas: {}, marcas: {}, alertas: null, fuenteAlertas: null } }));
    } catch (e) { setError((e as Error).message); } finally { setCargando(null); }
  };

  const pedirAlertas = async () => {
    if (!d) return;
    setCargando("alertas"); setError(null);
    try {
      const r = await fetch("/api/alertas", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...cuerpo, preguntas: d.preguntas.map(({ id, texto, criterioId }) => ({ id, texto, criterioId })), notas: Object.fromEntries(d.preguntas.map((p) => [p.id, notaParaIA(d, p.id)])) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudieron revisar las notas.");
      setS((x) => (x.defensa ? { ...x, defensa: { ...x.defensa, alertas: j.alertas, fuenteAlertas: j.fuente } } : x));
    } catch (e) { setError((e as Error).message); } finally { setCargando(null); }
  };

  const nota = (id: string, v: string) =>
    setS((x) => (x.defensa ? { ...x, defensa: { ...x.defensa, notas: { ...x.defensa.notas, [id]: v.slice(0, LIM.notaDefensa[1]) }, alertas: null } } : x));

  const marcar = (id: string, m: Marca) =>
    setS((x) => (x.defensa ? { ...x, defensa: { ...x.defensa, marcas: { ...(x.defensa.marcas ?? {}), [id]: m }, alertas: null } } : x));
  const anotadas = respondidas(d);
  const irAFirma = () => {
    setS((x) => ({ ...x, firma: { ...x.firma, nombreCompleto: x.firma.nombreCompleto || x.encargo.tutorNombre, cargo: x.firma.cargo || x.encargo.tutorCargo } }));
    irA(4);
  };

  return (
    <>
      <p className="quien">Juntos, en vivo · unos 15 minutos</p>
      <h2>03 · La defensa</h2>
      <p className="intro">
        El joven explica su trabajo en voz alta. La IA propone las preguntas a partir de la bitácora; el tutor escucha y
        anota lo que respondió. Lo que se prueba es el criterio, no el teclear.
      </p>
      <p className="regla-ia">La IA no califica. Propone preguntas y señala dónde repreguntar. La decisión es del tutor.</p>

      {!d && (
        <div className="botones" style={{ marginTop: 0 }}>
          <button className="btn sello" onClick={pedirPreguntas} disabled={cargando !== null}>
            {cargando === "preguntas" ? "Leyendo la bitácora…" : "Generar las 5 preguntas"}
          </button>
        </div>
      )}
      {error && <Errores lista={[error]} />}

      {d && (
        <>
          <div className="estado" style={{ marginTop: 0, marginBottom: 6 }}>
            <span className={`chip ${d.fuente === "gemini" ? "ok" : "sim"}`}>
              Preguntas: {d.fuente === "gemini" ? "propuestas por Gemini" : s.participante.iaPermitida ? "SIMULADAS (plantilla, no es IA)" : "de plantilla (el joven no autorizó la IA)"}
            </span>
            <span className="chip">{anotadas} de 5 respondidas · mínimo 4</span>
          </div>

          {d.preguntas.map((p, i) => (
            <div key={p.id} className="pregunta">
              <div>
                <span className="num">Pregunta {i + 1} · {p.criterioId}</span>
                <p className="txt">{p.texto}</p>
                {p.porQue && <p className="por">Qué busca: {p.porQue}</p>}
                <p className="por">Criterio: {criterio(p.criterioId)?.texto}</p>
              </div>
              <div>
                <span className="etiqueta">¿Cómo respondió?</span>
                <div className="marcas" role="group" aria-label={`Respuesta a la pregunta ${i + 1}`}>
                  {(Object.keys(MARCAS) as Marca[]).map((m) => (
                    <button key={m} className={m} aria-pressed={d.marcas?.[p.id] === m} onClick={() => marcar(p.id, m)}>{MARCAS[m]}</button>
                  ))}
                </div>
                <Campo id={`nota-${p.id}`} label="Nota (opcional)" area lim={[0, LIM.notaDefensa[1]]} valor={d.notas[p.id] ?? ""} onChange={(v) => nota(p.id, v)} />
              </div>
            </div>
          ))}

          {s.demo && (
            <div className="botones">
              <button className="btn-texto" onClick={() => setS((x) => (x.defensa ? { ...x, defensa: { ...x.defensa, notas: Object.fromEntries(x.defensa.preguntas.map((p, i) => [p.id, NOTAS_DEMO[i]])), marcas: Object.fromEntries(x.defensa.preguntas.map((p) => [p.id, "bien" as Marca])), alertas: null } } : x))}>
                Rellenar respuestas de ejemplo (solo en la demostración)
              </button>
            </div>
          )}

          <div className="botones">
            <button className="btn claro" onClick={pedirAlertas} disabled={cargando !== null || anotadas < 4}>
              {cargando === "alertas" ? "Revisando…" : "Pedir a la IA dónde repreguntar"}
            </button>
            <button className="btn" onClick={irAFirma} disabled={!defensaCompleta(d)}>Ir a la firma</button>
            {!defensaCompleta(d) && <p className="falta">Para firmar, marca cómo respondió al menos 4 preguntas (te {4 - anotadas === 1 ? "falta 1" : `faltan ${4 - anotadas}`}).</p>}
          </div>

          {d.alertas && (
            <div className="alertas">
              <h3>
                Dónde repreguntar
                <span className={`chip ${d.fuenteAlertas === "gemini" ? "ok" : "sim"}`}>{d.fuenteAlertas === "gemini" ? "Gemini" : "SIMULADO"}</span>
              </h3>
              {d.alertas.length === 0 && <p>No hay contradicciones ni huecos que señalar. La decisión sigue siendo tuya.</p>}
              {d.alertas.map((a, i) => (
                <div key={i} className="alerta">
                  <span className="tipo">{a.tipo === "contradiccion" ? "Contradicción" : a.tipo === "hueco" ? "Hueco" : "IA sin explicar"}</span>
                  <span>{a.texto}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ───────────── 04 · Firma ───────────── */

function PasoFirma({ s, setS, irA, selloActivo }: Props & { selloActivo: boolean }) {
  const f = s.firma;
  const [jura, setJura] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const set = <K extends keyof Firma>(k: K, v: Firma[K]) => setS((x) => ({ ...x, firma: { ...x.firma, [k]: v } }));
  const marcar = (id: string, v: "visto" | "no-visto") => set("vistos", { ...f.vistos, [id]: v });

  const firmar = async () => {
    const err = validarFirma(f, s.encargo, s.defensa);
    if (!jura) err.push("Confirma que supervisaste el trabajo y escuchaste la defensa.");
    setErrores(err);
    if (err.length) return;
    setEnviando(true);
    try {
      const r = await fetch("/api/sellar", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ encargo: s.encargo, bitacora: s.bitacora, defensa: s.defensa, firma: f, participante: s.participante }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo sellar.");
      setS((x) => ({ ...x, emitida: { constancia: j.constancia, fragmento: j.fragmento } }));
    } catch (e) { setErrores([(e as Error).message]); } finally { setEnviando(false); }
  };

  if (s.emitida) {
    const enlace = typeof window !== "undefined" ? `${window.location.origin}/verificar#${s.emitida.fragmento}` : "";
    const copiar = async () => {
      try { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { /* sin portapapeles */ }
    };
    return (
      <>
        <p className="quien">Lista para compartir</p>
        <h2>La constancia</h2>
        <p className="intro">
          Este enlace es la prueba. Quien lo abra ve qué se vio, qué no, quién firmó, y puede comprobar que nadie cambió una
          letra.
        </p>
        <Constancia c={s.emitida.constancia} autentica={null} />
        <div className="botones no-imprimir">
          <button className="btn" onClick={copiar}>{copiado ? "Copiado ✓" : "Copiar enlace"}</button>
          <a className="btn claro" href={`https://wa.me/?text=${encodeURIComponent(`Mi constancia de PRUEBA VIVA: ${enlace}`)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>Mandar por WhatsApp</a>
          <a className="btn claro" href={`/verificar#${s.emitida.fragmento}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>Abrir verificación</a>
          <button className="btn-texto" onClick={() => window.print()}>Imprimir</button>
        </div>
        <div className="siguiente no-imprimir">
          <p><b>Una constancia no es un empleo.</b> Lo que sigue lo lleva una coordinadora de PUENTE MX: un puesto vecino concreto, lo que te falta, una acción, quién responde y para cuándo. Tú recibes el resumen del caso.</p>
          <button className="btn sello" onClick={() => irA(5)}>Entregar a la coordinadora de PUENTE MX</button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="quien">Firma el tutor</p>
      <h2>04 · La firma</h2>
      <p className="intro">
        Marca criterio por criterio lo que viste de verdad. Lo que no viste también sale en la constancia: eso es lo que la
        hace creíble.
      </p>

      {s.encargo.criterios.map((id) => (
        <div key={id} className="fila-criterio">
          <span><span className="cod">{id}</span> {criterio(id)?.texto}</span>
          <div className="par" role="group" aria-label={`Criterio ${id}`}>
            <button className="si" aria-pressed={f.vistos[id] === "visto"} onClick={() => marcar(id, "visto")}>Lo vi</button>
            <button className="no" aria-pressed={f.vistos[id] === "no-visto"} onClick={() => marcar(id, "no-visto")}>No lo vi</button>
          </div>
        </div>
      ))}

      <div className="campos" style={{ marginTop: 16 }}>
        <Campo id="firmante" label="Tu nombre y apellido" lim={[3, 80]} valor={f.nombreCompleto} onChange={(v) => set("nombreCompleto", v)}
          ayuda="Ya viene escrito del encargo. Revisa que seas tú." />
        <Campo id="fcargo" label="Tu cargo" lim={LIM.cargo} valor={f.cargo} onChange={(v) => set("cargo", v)} />
        <Campo id="fnota" label="¿Qué viste en la defensa?" area ancho lim={LIM.notaFirma} valor={f.nota} onChange={(v) => set("nota", v)}
          ayuda="Con tus palabras. Esto aparece en la constancia." />
      </div>

      <label className="juramento">
        <input type="checkbox" checked={jura} onChange={(e) => setJura(e.target.checked)} />
        <span>Firmo que supervisé este trabajo y escuché la defensa en vivo. Sé que mi nombre aparece en la constancia.</span>
      </label>

      {!selloActivo && (
        <p className="errores" style={{ marginTop: 16 }}>
          El sello del servidor todavía no está configurado en este despliegue, así que la constancia no se puede emitir aún.
        </p>
      )}
      <Errores lista={errores} />
      <div className="botones">
        <button className="btn sello" onClick={firmar} disabled={enviando}>{enviando ? "Sellando…" : "Firmar y sellar"}</button>
      </div>
    </>
  );
}
