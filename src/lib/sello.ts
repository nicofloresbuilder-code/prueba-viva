/* Sello del servidor: HMAC-SHA256 sobre la constancia.
   Prueba dos cosas y nada más: que la constancia salió de esta app y que
   nadie le cambió una letra. No prueba que lo de adentro sea verdad: eso lo
   respalda la persona que firmó. (Es la misma advertencia del estándar W3C
   de credenciales verificables.)
   Solo se usa en el servidor; la llave vive en FIRMA_SECRETA en Vercel. */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Constancia } from "./types";

export function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

export function deB64url(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

/** Serialización estable: mismas llaves, mismo orden, siempre. */
export function canonico(c: Constancia): string {
  const orden = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(orden)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, orden((v as Record<string, unknown>)[k])]))
        : v;
  return JSON.stringify(orden(c));
}

export function sellar(c: Constancia, secreto: string): string {
  return createHmac("sha256", secreto).update(canonico(c)).digest("base64url");
}

export function sellosIguales(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** El enlace lleva la constancia y el sello en el fragmento (#), que el
    navegador nunca manda al servidor al abrir la página. */
export function fragmento(c: Constancia, sello: string): string {
  return `${b64url(canonico(c))}.${sello}`;
}
