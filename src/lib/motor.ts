/* El motor de reglas de PRUEBA VIVA.
   Todas las salvaguardas viven aquí y se aplican igual en el navegador y en
   cada ruta del servidor, para que no se puedan saltar desde otra pantalla.
   La autoprueba (src/lib/__selftest.ts) falla si alguna se rompe. */

import { criterio, estandar } from "./estandares";
import type {
  Alerta, Constancia, Defensa, Encargo, EntradaBitacora, Firma, Pregunta, TipoAlerta, TipoCentro,
} from "./types";

/* ───────────── Límites de cada campo (validación de entrada) ───────────── */

export const LIM = {
  titulo: [8, 120],
  quien: [10, 200],
  centro: [3, 80],
  alias: [2, 40],
  cargo: [3, 60],
  que: [15, 400],
  decision: [15, 400],
  paraQue: [10, 200],
  notaDefensa: [10, 500],
  notaFirma: [30, 500],
  criteriosMin: 2,
  criteriosMax: 6,
  entradasMin: 3,
  entradasMax: 30,
  preguntas: 5,
} as const;

function largo(v: string, [min, max]: readonly [number, number]): boolean {
  const n = v.trim().length;
  return n >= min && n <= max;
}

/* ───────────── Filtro de secretos y datos personales ─────────────
   Heredado de ESCUDO (semana 8), donde el persona test demostró que una
   promesa en pantalla no es una salvaguarda. Aquí se suman teléfono y correo:
   una constancia viaja por WhatsApp y no debe arrastrar datos de contacto. */

export type MotivoRechazo =
  | "llave_privada" | "api_key" | "contrasena" | "tarjeta" | "curp_rfc" | "telefono" | "correo" | null;

const PATRONES: { motivo: Exclude<MotivoRechazo, null>; re: RegExp }[] = [
  { motivo: "llave_privada", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { motivo: "api_key", re: /\b(sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{30,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/ },
  { motivo: "tarjeta", re: /\b(?:\d[ -]?){13,19}\b/ },
  { motivo: "curp_rfc", re: /\b([A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d|[A-ZÑ&]{4}\d{6}[A-Z0-9]{3})\b/ },
  { motivo: "telefono", re: /(?:\+?52[\s.-]?)?\b(?:\d[\s.-]?){10}\b/ },
  { motivo: "correo", re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/ },
];

const PALABRA_CREDENCIAL =
  /\b(contrase[nñ]as?|clave|claves|password|passwd|pass|pin|nip|credencial(?:es)?|token|usuario)\b/i;

function pareceCredencial(tok: string): boolean {
  if (tok.length < 6 || tok.length > 64) return false;
  const familias =
    Number(/[a-zñáéíóú]/.test(tok)) + Number(/[A-ZÑÁÉÍÓÚ]/.test(tok)) +
    Number(/\d/.test(tok)) + Number(/[^A-Za-zÑñÁÉÍÓÚáéíóú0-9]/.test(tok));
  if (familias < 2) return false;
  return /\d|[^A-Za-zÑñÁÉÍÓÚáéíóú0-9]/.test(tok.slice(1));
}

function traeCredencialEnProsa(texto: string): boolean {
  const m = PALABRA_CREDENCIAL.exec(texto);
  if (!m) return false;
  const cola = texto.slice(m.index + m[0].length, m.index + m[0].length + 90);
  return cola.split(/[\s,;]+/).some(pareceCredencial);
}

export const EXPLICACION_RECHAZO: Record<Exclude<MotivoRechazo, null>, string> = {
  llave_privada: "Eso parece una llave privada. Aquí no hace falta y no se guarda.",
  api_key: "Eso parece una llave de acceso de un sistema. Aquí no hace falta y no se guarda.",
  contrasena: "Eso parece una contraseña. Una constancia nunca necesita contraseñas.",
  tarjeta: "Eso parece un número de tarjeta o de cuenta. Aquí no va ningún dato de cobro.",
  curp_rfc: "Eso parece una CURP o un RFC de persona. La constancia no lleva datos que identifiquen a alguien.",
  telefono: "Eso parece un teléfono. La constancia viaja por WhatsApp y no debe llevar datos de contacto.",
  correo: "Eso parece un correo electrónico. La constancia no lleva datos de contacto.",
};

export function revisarTexto(texto: string): MotivoRechazo {
  for (const p of PATRONES) if (p.re.test(texto)) return p.motivo;
  if (traeCredencialEnProsa(texto)) return "contrasena";
  return null;
}

/* ───────────── Personas con nombre ───────────── */

export function nombreCompleto(n: string): boolean {
  const partes = n.trim().split(/\s+/).filter((p) => /^[\p{L}][\p{L}'.-]+$/u.test(p));
  return partes.length >= 2 && n.trim().length <= 80;
}

function normal(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/* ───────────── SALVAGUARDA 1 — Solo trabajo real ─────────────
   El capítulo dramatiza ofrecer algo que parece trabajo sin serlo. Una
   constancia por una tarea inventada es otra capa de señal rota. */

export const MOTIVO_PRACTICA =
  "No se emiten constancias por tareas de práctica. Una constancia solo vale si alguien necesitaba ese trabajo de verdad.";

export function validarEncargo(e: Encargo): string[] {
  const err: string[] = [];
  if (!largo(e.titulo, LIM.titulo)) err.push("El encargo necesita un título de 8 a 120 caracteres.");
  if (!largo(e.quienLoNecesitaba, LIM.quien)) err.push("Escribe quién necesitaba este trabajo y para qué (10 a 200 caracteres).");
  if (e.origen === "practica") err.push(MOTIVO_PRACTICA);
  if (!["pagado", "jcf", "practica"].includes(e.origen)) err.push("Origen no válido.");
  if (!largo(e.centroNombre, LIM.centro)) err.push("Escribe el nombre del centro de trabajo.");
  if (!["jcf", "negocio-rfc", "negocio-sin-registro", "otro"].includes(e.centroTipo)) err.push("Tipo de centro no válido.");
  const est = estandar(e.estandar);
  if (!est) err.push("Elige un estándar de competencia.");
  const n = e.criterios.length;
  if (n < LIM.criteriosMin || n > LIM.criteriosMax) err.push("Elige de 2 a 6 criterios a demostrar.");
  if (est && e.criterios.some((id) => criterio(id)?.estandar.codigo !== est.codigo))
    err.push("Todos los criterios deben ser del estándar elegido.");
  if (new Set(e.criterios).size !== n) err.push("Hay criterios repetidos.");
  if (!largo(e.alias, LIM.alias)) err.push("Escribe cómo quiere aparecer el joven en la constancia (2 a 40 caracteres).");
  if (!nombreCompleto(e.tutorNombre)) err.push("El tutor debe escribir nombre y apellido.");
  if (!largo(e.tutorCargo, LIM.cargo)) err.push("Escribe el cargo del tutor.");
  for (const t of [e.titulo, e.quienLoNecesitaba, e.centroNombre, e.alias, e.tutorNombre, e.tutorCargo]) {
    const m = revisarTexto(t);
    if (m) { err.push(EXPLICACION_RECHAZO[m]); break; }
  }
  return err;
}

/* ───────────── SALVAGUARDA 2 — El proceso queda registrado ─────────────
   Si se usó IA, se declara y se dice para qué. Usarla no descalifica:
   esconderla sí. */

export function validarEntrada(en: Pick<EntradaBitacora, "que" | "decision" | "usoIA" | "paraQueIA">): string[] {
  const err: string[] = [];
  if (!largo(en.que, LIM.que)) err.push("Describe qué hiciste (15 a 400 caracteres).");
  if (!largo(en.decision, LIM.decision)) err.push("Escribe qué decidiste y por qué (15 a 400 caracteres).");
  if (en.usoIA && !largo(en.paraQueIA, LIM.paraQue)) err.push("Si usaste IA, di para qué (10 a 200 caracteres).");
  for (const t of [en.que, en.decision, en.paraQueIA]) {
    const m = revisarTexto(t);
    if (m) { err.push(EXPLICACION_RECHAZO[m]); break; }
  }
  return err;
}

export function listoParaDefensa(b: EntradaBitacora[]): boolean {
  return b.length >= LIM.entradasMin && b.length <= LIM.entradasMax && b.every((x) => validarEntrada(x).length === 0);
}

/* ───────────── SALVAGUARDA 3 — La IA pregunta y señala; nunca califica ─────────────
   Lo que devuelva el modelo pasa por aquí. Se aceptan solo los campos
   esperados; cualquier puntaje, calificación o veredicto se descarta. */

const CAMPOS_PROHIBIDOS = /calificaci|puntaj|score|grade|rating|aprob|reprob|veredicto|apto|nivel_?de_?dominio/i;

export function respuestaTraeCalificacion(raw: unknown): boolean {
  return CAMPOS_PROHIBIDOS.test(JSON.stringify(raw ?? ""));
}

export function validarPreguntas(raw: unknown, criteriosPermitidos: string[]): Pregunta[] | null {
  const arr = Array.isArray(raw) ? raw : (raw as { preguntas?: unknown })?.preguntas;
  if (!Array.isArray(arr) || arr.length < LIM.preguntas) return null;
  const out: Pregunta[] = [];
  for (const [i, p] of arr.slice(0, LIM.preguntas).entries()) {
    const texto = String((p as Record<string, unknown>)?.texto ?? "").trim();
    let criterioId = String((p as Record<string, unknown>)?.criterioId ?? "").trim();
    const porQue = String((p as Record<string, unknown>)?.porQue ?? "").trim();
    if (texto.length < 15 || texto.length > 300 || !texto.includes("?")) return null;
    if (CAMPOS_PROHIBIDOS.test(texto)) return null;
    if (!criteriosPermitidos.includes(criterioId)) criterioId = criteriosPermitidos[i % criteriosPermitidos.length];
    out.push({ id: `p${i + 1}`, texto, criterioId, porQue: porQue.slice(0, 240) });
  }
  return out;
}

const TIPOS_ALERTA: TipoAlerta[] = ["contradiccion", "hueco", "ia-sin-explicar"];

export function validarAlertas(raw: unknown): Alerta[] | null {
  const arr = Array.isArray(raw) ? raw : (raw as { alertas?: unknown })?.alertas;
  if (!Array.isArray(arr)) return null;
  const out: Alerta[] = [];
  for (const a of arr.slice(0, 6)) {
    const tipo = String((a as Record<string, unknown>)?.tipo ?? "") as TipoAlerta;
    const texto = String((a as Record<string, unknown>)?.texto ?? "").trim();
    if (!TIPOS_ALERTA.includes(tipo) || texto.length < 10 || texto.length > 300) continue;
    if (CAMPOS_PROHIBIDOS.test(texto)) continue;
    out.push({ tipo, texto });
  }
  return out;
}

export function defensaCompleta(d: Defensa | null): boolean {
  if (!d || d.preguntas.length !== LIM.preguntas) return false;
  const anotadas = d.preguntas.filter((p) => largo(d.notas[p.id] ?? "", LIM.notaDefensa)).length;
  return anotadas >= 4;
}

/* ───────────── SALVAGUARDA 4 — Firma una persona, criterio por criterio ───────────── */

export function validarFirma(f: Firma, e: Encargo, d: Defensa | null): string[] {
  const err: string[] = [];
  if (!defensaCompleta(d)) err.push("Primero hay que hacer la defensa en vivo y anotar al menos 4 de las 5 respuestas.");
  if (!nombreCompleto(f.nombreCompleto)) err.push("Firma con nombre y apellido.");
  else if (normal(f.nombreCompleto) !== normal(e.tutorNombre))
    err.push(`Firma quien supervisó: el nombre debe coincidir con el del tutor (${e.tutorNombre}).`);
  if (!largo(f.cargo, LIM.cargo)) err.push("Escribe tu cargo.");
  const faltan = e.criterios.filter((id) => !f.vistos[id]);
  if (faltan.length) err.push("Marca cada criterio: lo vi o no lo vi.");
  if (!e.criterios.some((id) => f.vistos[id] === "visto")) err.push("Si no viste ningún criterio, no hay nada que constar.");
  if (!largo(f.nota, LIM.notaFirma)) err.push("Escribe en 30 a 500 caracteres qué viste en la defensa.");
  const m = revisarTexto(f.nota) ?? revisarTexto(f.cargo);
  if (m) err.push(EXPLICACION_RECHAZO[m]);
  return err;
}

/* ───────────── El peso de la firma: declarado, nunca disfrazado ───────────── */

export const PESO: Record<TipoCentro, { etiqueta: string; detalle: string; nivel: 1 | 2 | 3 }> = {
  "negocio-rfc": { etiqueta: "Negocio con RFC", detalle: "El tutor declaró que el negocio está dado de alta en el SAT.", nivel: 3 },
  jcf: { etiqueta: "Centro de trabajo de JCF", detalle: "El tutor declaró que es un centro de Jóvenes Construyendo el Futuro.", nivel: 3 },
  "negocio-sin-registro": { etiqueta: "Negocio sin registro", detalle: "El tutor declaró un negocio sin alta formal. La firma es real, pero tiene menos respaldo.", nivel: 1 },
  otro: { etiqueta: "Otro", detalle: "Tipo de centro no especificado.", nivel: 2 },
};

/* ───────────── La constancia ───────────── */

export function construirConstancia(e: Encargo, b: EntradaBitacora[], d: Defensa, f: Firma, codigo: string, ahora: Date): Constancia {
  const est = estandar(e.estandar)!;
  const tiempos = b.map((x) => x.t).sort();
  const texto = (id: string) => ({ id, texto: criterio(id)?.texto ?? id });
  return {
    v: 1,
    codigo,
    emitida: ahora.toISOString(),
    alias: e.alias.trim(),
    encargo: e.titulo.trim(),
    quienLoNecesitaba: e.quienLoNecesitaba.trim(),
    origen: e.origen === "practica" ? "pagado" : e.origen,
    centro: { nombre: e.centroNombre.trim(), tipo: e.centroTipo },
    estandar: { codigo: est.codigo, titulo: est.titulo, dof: est.dof },
    vistos: e.criterios.filter((id) => f.vistos[id] === "visto").map(texto),
    noVistos: e.criterios.filter((id) => f.vistos[id] === "no-visto").map(texto),
    tutor: { nombre: f.nombreCompleto.trim(), cargo: f.cargo.trim() },
    nota: f.nota.trim(),
    bitacora: { entradas: b.length, desde: tiempos[0], hasta: tiempos[tiempos.length - 1], conIA: b.filter((x) => x.usoIA).length },
    defensa: { preguntas: d.preguntas.length, fuente: d.fuente },
  };
}

/** Lo que una constancia nunca prueba, escrito en la constancia misma. */
export const NO_PRUEBA = [
  "No es una certificación oficial de CONOCER: usa sus criterios, pero no sustituye una evaluación acreditada.",
  "No prueba nada fuera de este encargo ni de los criterios marcados como vistos.",
  "El tipo de centro de trabajo es declarado por el tutor; esta app no verifica RFC ni inscripción a JCF.",
  "La IA no calificó a nadie: solo propuso preguntas y señaló posibles contradicciones al tutor.",
];

export function codigoConstancia(rand: () => number = Math.random): string {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += abc[Math.floor(rand() * abc.length)];
  return `PV-${s.slice(0, 4)}-${s.slice(4)}`;
}

export function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City" });
}

export function fmtHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" });
}
