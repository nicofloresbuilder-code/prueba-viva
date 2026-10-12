"use client";

/* Paso 05 · El siguiente paso (Blueprint PUENTE MX, pasos 5 a 7, rol de Regina).
   Una constancia sola no es una transición. Aquí una coordinadora con nombre convierte
   la prueba en un puesto vecino concreto, lo que falta, una acción, una fecha y un
   seguimiento con evidencia. Nada se marca como éxito solo porque existe la constancia. */

import { useState } from "react";
import { Campo, Errores } from "./campos";
import type { Estado } from "./PruebaViva";
import {
  cuentaHonesta, DEMANDA, ESTADOS, evidenciasDisponibles, fmtFecha, LIM, PUESTOS_VECINOS, puedeCambiarEstado,
  RESULTADOS, transicionConfirmada, validarPuente, validarResultado,
} from "@/lib/motor";
import type { EstadoCaso, Puente, TipoResultado } from "@/lib/types";

const VACIO: Puente = {
  coordinador: "", puesto: "", evidencias: [], demanda: "ilustrativa", fuenteDemanda: "", verificadaEl: "",
  falta: "", accion: "", fechaLimite: "", escalamiento: "", estado: "abierto", resultados: [], guardado: false,
};

function hoy(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export default function PasoPuente({ s, setS, demoPuente }: {
  s: Estado; setS: React.Dispatch<React.SetStateAction<Estado>>; demoPuente: () => Puente;
}) {
  const c = s.emitida?.constancia ?? null;
  const pu = s.puente ?? VACIO;
  const [errores, setErrores] = useState<string[]>([]);
  const setPu = (q: Partial<Puente>) => setS((x) => ({ ...x, puente: { ...(x.puente ?? VACIO), ...q } }));
  const disp = evidenciasDisponibles(c, s.participante);
  const sugeridos = PUESTOS_VECINOS[s.encargo.estandar] ?? [];
  const bloqueado = pu.guardado;

  const guardar = () => {
    const err = validarPuente(pu, c, s.participante, new Date());
    setErrores(err);
    if (!err.length) setPu({ guardado: true });
  };

  return (
    <>
      <p className="quien">Lo lleva la coordinadora de PUENTE MX</p>
      <h2>05 · El siguiente paso</h2>
      <p className="intro">
        Una constancia no es un empleo. Aquí alguien con nombre convierte lo que se vio en un puesto vecino concreto: qué
        lo respalda, qué falta, qué se hace, quién responde y para cuándo.
      </p>

      {s.demo && !pu.coordinador && (
        <div className="botones" style={{ marginTop: 0, marginBottom: 16 }}>
          <button className="btn claro" onClick={() => setS((x) => ({ ...x, puente: demoPuente() }))}>Llenar con el ejemplo inventado</button>
        </div>
      )}

      <fieldset disabled={bloqueado} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="campos">
          <Campo id="coord" label="Coordinadora o coordinador del caso" lim={[3, 80]} valor={pu.coordinador} onChange={(v) => setPu({ coordinador: v })}
            ayuda="Nombre y apellido. Es quien responde si el caso se atora." />
          <div className="campo">
            <label htmlFor="puesto">Puesto vecino</label>
            <input id="puesto" type="text" list="puestos" value={pu.puesto} maxLength={LIM.puesto[1]} onChange={(e) => setPu({ puesto: e.target.value })} />
            <datalist id="puestos">{sugeridos.map((x) => <option key={x} value={x} />)}</datalist>
            <p className="ayuda">Uno solo. Sugerencias: {sugeridos.join(", ")}.</p>
          </div>
        </div>

        <div className="campo ancho" style={{ marginTop: 16 }}>
          <span className="etiqueta">¿Qué lo respalda? Liga cada habilidad a su evidencia</span>
          <p className="ayuda">Al menos una tiene que ser algo que el tutor vio. Lo demás aparece como no verificado.</p>
          {disp.map((ev) => (
            <label key={ev.id} className="criterio">
              <input type="checkbox" checked={pu.evidencias.includes(ev.id)}
                onChange={() => setPu({ evidencias: pu.evidencias.includes(ev.id) ? pu.evidencias.filter((x) => x !== ev.id) : [...pu.evidencias, ev.id] })} />
              <span>{ev.texto} <span className={`fuente ${ev.verificada ? "ver" : "nover"}`}>{ev.fuente}</span></span>
            </label>
          ))}
        </div>

        <div className="campo ancho" style={{ marginTop: 16 }}>
          <span className="etiqueta">¿Hay demanda real para ese puesto?</span>
          <div className="opciones" role="radiogroup">
            {(["ilustrativa", "verificada"] as const).map((v) => (
              <label key={v} className={`opcion${pu.demanda === v ? " activa" : ""}`}>
                <input type="radio" name="demanda" checked={pu.demanda === v} onChange={() => setPu({ demanda: v })} />
                {v === "verificada" ? "Verificada" : "Ilustrativa"}
              </label>
            ))}
          </div>
          <p className="ayuda">{DEMANDA[pu.demanda]}</p>
        </div>
        {pu.demanda === "verificada" && (
          <div className="campos" style={{ marginTop: 10 }}>
            <Campo id="fdem" label="¿Qué empleador u oportunidad, y cómo lo verificaste?" area ancho lim={LIM.fuenteDemanda} valor={pu.fuenteDemanda} onChange={(v) => setPu({ fuenteDemanda: v })}
              ayuda="Sin datos de contacto. Ej. “Despacho X confirmó por correo que contrata auxiliares en noviembre”." />
            <div className="campo">
              <label htmlFor="vel">¿Cuándo lo verificaste?</label>
              <input id="vel" type="date" max={hoy()} value={pu.verificadaEl} onChange={(e) => setPu({ verificadaEl: e.target.value })} />
            </div>
          </div>
        )}

        <div className="campos" style={{ marginTop: 16 }}>
          <Campo id="falta" label="La habilidad que falta (una sola)" ancho lim={LIM.falta} valor={pu.falta} onChange={(v) => setPu({ falta: v })} />
          <Campo id="accion" label="La siguiente acción para cerrarla o demostrarla" area ancho lim={LIM.accion} valor={pu.accion} onChange={(v) => setPu({ accion: v })}
            ayuda="Algo que se pueda hacer y comprobar. Un curso caro no es una acción si no lleva a nada verificado." />
          <div className="campo">
            <label htmlFor="flim">Fecha límite</label>
            <input id="flim" type="date" min={hoy()} value={pu.fechaLimite} onChange={(e) => setPu({ fechaLimite: e.target.value })} />
            <p className="ayuda">Máximo 90 días.</p>
          </div>
          <Campo id="esc" label="Si nadie responde, ¿a quién se escala y cuándo?" lim={LIM.escalamiento} valor={pu.escalamiento} onChange={(v) => setPu({ escalamiento: v })} />
        </div>
      </fieldset>

      <Errores lista={errores} />
      {!bloqueado && (
        <div className="botones">
          <button className="btn" onClick={guardar}>Abrir el caso</button>
        </div>
      )}

      {bloqueado && <Caso s={s} setS={setS} />}

      <CuentaHonesta s={s} />
    </>
  );
}

function Caso({ s, setS }: { s: Estado; setS: React.Dispatch<React.SetStateAction<Estado>> }) {
  const pu = s.puente!;
  const c = s.emitida?.constancia ?? null;
  const [tipo, setTipo] = useState<TipoResultado>("sin-respuesta");
  const [fecha, setFecha] = useState(hoy());
  const [evidencia, setEvidencia] = useState("");
  const [quien, setQuien] = useState(pu.coordinador);
  const [errores, setErrores] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const registrar = () => {
    const r = { tipo, fecha, evidencia, confirmadoPor: quien };
    const err = validarResultado(r, pu, c, new Date());
    setErrores(err);
    if (err.length) return;
    setS((x) => ({ ...x, puente: { ...x.puente!, resultados: [...x.puente!.resultados, { ...r, id: `r${Date.now()}`, registrado: new Date().toISOString() }] } }));
    setEvidencia("");
  };

  const cambiar = (a: EstadoCaso) => {
    const m = puedeCambiarEstado(pu, a, new Date());
    setAviso(m);
    if (!m) setS((x) => ({ ...x, puente: { ...x.puente!, estado: a } }));
  };

  return (
    <div className="caso">
      <div className="caso-encab">
        <span className="chip">{ESTADOS[pu.estado]}</span>
        <span className={`chip ${pu.demanda === "verificada" ? "ok" : "sim"}`}>{pu.demanda === "verificada" ? "Demanda verificada" : "ILUSTRATIVO · no es una vacante"}</span>
      </div>
      <p className="grande" style={{ margin: "8px 0 2px" }}>{s.encargo.alias} → {pu.puesto}</p>
      <p><b>Le falta:</b> {pu.falta}</p>
      <p><b>Siguiente acción:</b> {pu.accion}</p>
      <p><b>Responde:</b> {pu.coordinador} · <b>Fecha límite:</b> {fmtFecha(`${pu.fechaLimite}T12:00:00`)}</p>
      <p><b>Si nadie responde:</b> {pu.escalamiento}</p>
      {pu.demanda === "verificada" && <p><b>Demanda:</b> {pu.fuenteDemanda} (verificada el {fmtFecha(`${pu.verificadaEl}T12:00:00`)})</p>}

      <div className="botones">
        <button className="btn claro" onClick={() => cambiar("accion-hecha")}>Marcar acción completada</button>
        <button className="btn claro" onClick={() => cambiar("sin-respuesta-escalado")}>Escalar por falta de respuesta</button>
        <button className="btn claro" onClick={() => cambiar("cerrado")}>Cerrar caso</button>
      </div>
      {aviso && <p className="errores">{aviso}</p>}

      <h3 style={{ marginTop: 22 }}>Seguimiento</h3>
      {pu.resultados.length === 0 && <p className="ayuda">Todavía no hay resultados. Una constancia emitida no cuenta como resultado.</p>}
      <ul className="resultados">
        {pu.resultados.map((r) => (
          <li key={r.id}><span className="cod">{fmtFecha(`${r.fecha}T12:00:00`)}</span> <b>{RESULTADOS[r.tipo]}</b> — {r.evidencia} <span className="cod">(confirmó {r.confirmadoPor})</span></li>
        ))}
      </ul>
      <div className="nueva" style={{ marginTop: 10 }}>
        <h3>Registrar un resultado</h3>
        <div className="campos">
          <div className="campo">
            <label htmlFor="rtipo">¿Qué pasó?</label>
            <select id="rtipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoResultado)}>
              {(Object.keys(RESULTADOS) as TipoResultado[]).map((k) => <option key={k} value={k}>{RESULTADOS[k]}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="rfecha">¿Cuándo?</label>
            <input id="rfecha" type="date" max={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <Campo id="rev" label="¿Qué lo confirma?" area ancho lim={LIM.evidenciaResultado} valor={evidencia} onChange={setEvidencia}
            ayuda="Ej. correo del empleador con fecha de entrevista, recibo del pago. Sin pegar datos personales." />
          <Campo id="rquien" label="¿Quién lo confirmó?" lim={[3, 80]} valor={quien} onChange={setQuien} />
        </div>
        <Errores lista={errores} />
        <div className="botones"><button className="btn" onClick={registrar}>Registrar</button></div>
      </div>
    </div>
  );
}

function CuentaHonesta({ s }: { s: Estado }) {
  const filas = cuentaHonesta(s.emitida?.constancia ?? null, s.puente);
  return (
    <div className="cuenta">
      <h3>La cuenta honesta</h3>
      <table>
        <tbody>
          {filas.map((f) => <tr key={f.etiqueta}><td>{f.etiqueta}</td><td className="cod">{f.valor}</td></tr>)}
        </tbody>
      </table>
      <p className="ayuda">
        {transicionConfirmada(s.puente)
          ? "Hay una transición confirmada con evidencia."
          : "Todavía no hay transición: ni la constancia ni el caso abierto cuentan como empleo."}{" "}
        {s.demo && "Todo es un ejemplo inventado: esto demuestra el flujo, no un resultado."}
      </p>
    </div>
  );
}
