"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Constancia from "./Constancia";
import type { Constancia as C } from "@/lib/types";

type Resultado =
  | { estado: "vacio" }
  | { estado: "revisando" }
  | { estado: "autentica"; c: C }
  | { estado: "falsa"; motivo: string }
  | { estado: "error"; motivo: string };

export default function Verificar() {
  const [r, setR] = useState<Resultado>({ estado: "vacio" });
  const [pegado, setPegado] = useState("");

  const verificar = async (fragmento: string) => {
    setR({ estado: "revisando" });
    try {
      const res = await fetch("/api/verificar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fragmento }) });
      const j = await res.json();
      if (!res.ok) setR({ estado: "error", motivo: j.error || "No se pudo verificar." });
      else if (j.autentica) setR({ estado: "autentica", c: j.constancia });
      else setR({ estado: "falsa", motivo: j.motivo });
    } catch { setR({ estado: "error", motivo: "No hay conexión con el servidor." }); }
  };

  useEffect(() => {
    const leer = () => { const h = window.location.hash.slice(1); if (h) verificar(h); };
    leer();
    window.addEventListener("hashchange", leer);
    return () => window.removeEventListener("hashchange", leer);
  }, []);

  return (
    <div className="envoltura">
      <header className="cabecera">
        <div>
          <h1 className="marca">Prueba<br /><span>Viva</span></h1>
          <div className="estado"><span className="chip">Verificación de constancia</span></div>
        </div>
        <p className="lema">
          Esta página comprueba dos cosas: que la constancia salió de PRUEBA VIVA y que nadie le cambió una letra. Lo que
          dice lo respalda la persona que firmó.
        </p>
      </header>

      <section className="panel" style={{ borderTop: "1.5px solid var(--tinta)", marginTop: 26 }}>
        {r.estado === "revisando" && <p>Revisando el sello…</p>}
        {r.estado === "autentica" && (
          <>
            <p className="exito" style={{ marginTop: 0 }}><b>Auténtica.</b> El sello coincide: esta constancia salió de PRUEBA VIVA y no fue alterada.</p>
            <Constancia c={r.c} autentica />
          </>
        )}
        {(r.estado === "falsa" || r.estado === "error") && (
          <div className="errores" style={{ marginTop: 0 }}>
            <p><b>{r.estado === "falsa" ? "No es auténtica." : "No se pudo verificar."}</b> {r.motivo}</p>
          </div>
        )}
        {(r.estado === "vacio" || r.estado === "falsa" || r.estado === "error") && (
          <div style={{ marginTop: 18 }}>
            <div className="campo">
              <label htmlFor="pegar">Pega aquí el enlace que te mandaron</label>
              <input id="pegar" type="text" value={pegado} onChange={(e) => setPegado(e.target.value.slice(0, 13000))} placeholder="https://…/verificar#…" />
            </div>
            <div className="botones">
              <button className="btn" onClick={() => { const h = pegado.split("#")[1]; if (h) { window.location.hash = h; } else setR({ estado: "falsa", motivo: "El enlace no trae ninguna constancia." }); }}>Verificar</button>
              <Link className="btn-texto" href="/">Ir a PRUEBA VIVA</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
