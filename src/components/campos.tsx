"use client";

import { useState } from "react";
import { EXPLICACION_RECHAZO, revisarTexto } from "@/lib/motor";

/* ───────────── Campos con filtro de secretos ───────────── */

export function Campo(props: {
  id: string; label: string; ayuda?: string; valor: string; onChange: (v: string) => void;
  lim: readonly [number, number]; area?: boolean; ancho?: boolean; placeholder?: string;
}) {
  const { id, label, ayuda, valor, onChange, lim, area, ancho, placeholder } = props;
  const [rechazo, setRechazo] = useState<string | null>(null);
  const n = valor.trim().length;
  const cambiar = (v: string) => {
    const m = revisarTexto(v);
    if (m) { setRechazo(EXPLICACION_RECHAZO[m]); return; }
    setRechazo(null);
    onChange(v.slice(0, lim[1] + 50));
  };
  return (
    <div className={`campo${ancho ? " ancho" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {ayuda && <p className="ayuda">{ayuda}</p>}
      {area ? (
        <textarea id={id} value={valor} placeholder={placeholder} onChange={(e) => cambiar(e.target.value)} maxLength={lim[1] + 50} />
      ) : (
        <input id={id} type="text" value={valor} placeholder={placeholder} onChange={(e) => cambiar(e.target.value)} maxLength={lim[1] + 50} />
      )}
      {rechazo && <p className="rechazo" role="alert">No se guardó: {rechazo}</p>}
      <span className={`contador${n > 0 && (n < lim[0] || n > lim[1]) ? " mal" : ""}`}>{n} / {lim[1]}{n > 0 && n < lim[0] ? ` · mínimo ${lim[0]}` : ""}</span>
    </div>
  );
}

export function Errores({ lista }: { lista: string[] }) {
  if (!lista.length) return null;
  return (
    <div className="errores" role="alert">
      {lista.map((e) => <p key={e}>{e}</p>)}
    </div>
  );
}

