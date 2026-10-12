/* El motor de reglas de PRUEBA VIVA.
   Todas las salvaguardas viven aquí y se aplican igual en el navegador y en
   cada ruta del servidor, para que no se puedan saltar desde otra pantalla.
   La autoprueba (src/lib/__selftest.ts) falla si alguna se rompe. */

import { criterio, estandar } from "./estandares";
import type {
  Alerta, Constancia, Defensa, Encargo, EntradaBitacora, EstadoCaso, Firma, FuenteEvidencia, Marca, Participante, Pregunta, Puente,
  MotivoCierre, Resultado, TipoAlerta, TipoCentro, TipoResultado,
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
  pago: [8, 120],
  alcance: [15, 300],
  disputa: [15, 200],
  previa: [10, 200],
  previasMax: 5,
  puesto: [3, 80],
  fuenteDemanda: [15, 300],
  falta: [10, 200],
  accion: [15, 300],
  escalamiento: [15, 200],
  evidenciaResultado: [15, 300],
  plazoMaxDias: 90,
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
  /* Blueprint PUENTE MX, sombra "mano de obra barata": pago, alcance, revisión y
     ruta de disputa se declaran y se muestran ANTES de empezar. */
  if (!largo(e.pago ?? "", LIM.pago)) err.push("Escribe cuánto se paga y quién lo paga (o la beca que lo financia).");
  else if (/\b(gratis|sin pago|no se paga|a prueba|de prueba sin|voluntario)\b/i.test(e.pago)) err.push("Un trabajo sin pago no se pasa como oportunidad. Si no hay pago ni beca, no hay encargo.");
  if (!largo(e.alcance ?? "", LIM.alcance)) err.push("Escribe el alcance: qué entra y qué no, y cuánto dura (15 a 300 caracteres).");
  if (!largo(e.rutaDisputa ?? "", LIM.disputa)) err.push("Escribe a quién acude el joven si no está de acuerdo con la revisión o con el pago.");
  if (!["verificada", "no", "no-se"].includes(e.rutaReal)) err.push("Indica si existe un puesto o ruta real después de este encargo.");
  if (!e.mostradoAntes) err.push("Confirma que le mostraste al joven el pago, el alcance, los criterios y la ruta de disputa antes de empezar.");
  for (const t of [e.titulo, e.quienLoNecesitaba, e.centroNombre, e.alias, e.tutorNombre, e.tutorCargo, e.pago ?? "", e.alcance ?? "", e.rutaDisputa ?? ""]) {
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

/* Blueprint, paso 2: el participante consiente y puede declarar experiencia
   previa, también informal. Lo que no se verificó aquí se ve como no verificado. */
export const FUENTE_EVIDENCIA: Record<FuenteEvidencia, { etiqueta: string; confianza: "baja" | "media" }> = {
  autodeclarada: { etiqueta: "Lo dice el participante (no verificado)", confianza: "baja" },
  muestra: { etiqueta: "Hay una muestra de trabajo (no revisada aquí)", confianza: "media" },
  testigo: { etiqueta: "Alguien lo vio, según el participante (no verificado)", confianza: "media" },
};

export function validarParticipante(p: Participante): string[] {
  const err: string[] = [];
  if (!p.consiente) err.push("Tienes que aceptar que tu tutor lea tu bitácora: sin eso no hay defensa.");
  if (!p.vioCondiciones) err.push("Confirma que viste cuánto te pagan, qué entra en el trabajo y a quién reclamar.");
  if (p.previas.length > LIM.previasMax) err.push("Máximo 5 tareas previas.");
  for (const x of p.previas) {
    if (!largo(x.tarea, LIM.previa)) { err.push("Cada tarea previa necesita de 10 a 200 caracteres."); break; }
    if (!(x.fuente in FUENTE_EVIDENCIA)) { err.push("Fuente de evidencia no válida."); break; }
    const m = revisarTexto(x.tarea);
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

/* Persona test: Don Rogelio no iba a escribir cinco notas con el pulgar.
   Ahora basta un toque por pregunta (lo explicó bien / dudó / no supo); la
   nota escrita es opcional, pero si se escribe tiene límite. */
export const MARCAS: Record<Marca, string> = { bien: "Lo explicó bien", dudo: "Dudó", "no-supo": "No supo" };

export function respondidas(d: Defensa | null): number {
  if (!d) return 0;
  return d.preguntas.filter((p) => Boolean(d.marcas?.[p.id])).length;
}

export function defensaCompleta(d: Defensa | null): boolean {
  if (!d || d.preguntas.length !== LIM.preguntas) return false;
  if (Object.values(d.notas ?? {}).some((n) => n.length > LIM.notaDefensa[1])) return false;
  return respondidas(d) >= 4;
}

/** Lo que se le manda a la IA de cada respuesta: la marca del tutor y su nota. */
export function notaParaIA(d: Defensa, id: string): string {
  const m = d.marcas?.[id];
  const n = (d.notas?.[id] ?? "").trim();
  return [m ? `${MARCAS[m]}.` : "", n].filter(Boolean).join(" ");
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
    pago: (e.pago ?? "").trim(),
    bitacora: { entradas: b.length, desde: tiempos[0], hasta: tiempos[tiempos.length - 1], conIA: b.filter((x) => x.usoIA).length },
    defensa: { preguntas: d.preguntas.length, fuente: d.fuente },
  };
}

/** Lo que una constancia nunca prueba, escrito en la constancia misma. */
export const NO_PRUEBA = [
  "No es una certificación oficial de CONOCER: usa sus criterios, pero no sustituye una evaluación acreditada.",
  "No prueba nada fuera de este encargo ni de los criterios que el tutor vio.",
  "El tipo de centro de trabajo es declarado por el tutor; esta app no verifica RFC ni inscripción a JCF.",
  "La IA no calificó a nadie: solo propuso preguntas y señaló posibles contradicciones al tutor.",
  "La firma dice lo que el tutor observó; no garantiza desempeño futuro ni un empleo.",
];

/* ───────────── BLUEPRINT PUENTE MX · El puente del operador (pasos 5 a 7) ─────────────
   Una constancia sola no es una transición. Alguien con nombre tiene que convertir
   la prueba en un siguiente paso concreto y dar seguimiento. Reglas del Blueprint:
   cada habilidad se liga a evidencia; la demanda tiene fuente o se dice ilustrativa;
   todo caso tiene responsable, acción, fecha y escalamiento; y nada se marca como
   éxito solo porque existe una constancia. */

export const PUESTOS_VECINOS: Record<string, string[]> = {
  EC0305: ["Auxiliar administrativo", "Recepcionista", "Ejecutivo/a de atención a clientes", "Analista de calidad en atención a clientes"],
  EC0254: ["Agente de ventas telefónicas", "Ejecutivo/a de retención de clientes", "Customer success junior"],
};

export const DEMANDA = {
  verificada: "Verificada: hay un empleador u oportunidad pagada concreta, con fuente y fecha.",
  ilustrativa: "ILUSTRATIVA: es un camino posible, no una vacante. Nadie tiene un lugar reservado.",
} as const;

export const ESTADOS: Record<EstadoCaso, string> = {
  abierto: "Abierto",
  "accion-hecha": "Acción completada",
  "sin-respuesta-escalado": "Sin respuesta · escalado",
  cerrado: "Cerrado",
};

export const RESULTADOS: Record<TipoResultado, string> = {
  invitacion: "Invitación de un empleador",
  entrevista: "Entrevista",
  "prueba-pagada": "Prueba pagada",
  contratacion: "Contratación",
  "sin-respuesta": "Sin respuesta",
};

function fechaValida(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T12:00:00`).getTime());
}
function dia(s: string): number {
  return new Date(`${s}T12:00:00`).getTime();
}
function hoyISO(ahora: Date): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${ahora.getFullYear()}-${z(ahora.getMonth() + 1)}-${z(ahora.getDate())}`;
}

/** Las evidencias que el operador puede usar: lo que el tutor vio, y lo previo marcado como no verificado. */
export function evidenciasDisponibles(c: Constancia | null, p: Participante): { id: string; texto: string; fuente: string; verificada: boolean }[] {
  const vistas = (c?.vistos ?? []).map((v) => ({ id: v.id, texto: v.texto, fuente: `Observado por ${c?.tutor.nombre} en el encargo`, verificada: true }));
  const previas = p.previas.map((x) => ({ id: x.id, texto: x.tarea, fuente: FUENTE_EVIDENCIA[x.fuente].etiqueta, verificada: false }));
  return [...vistas, ...previas];
}

export function validarPuente(pu: Puente, c: Constancia | null, p: Participante, ahora: Date): string[] {
  const err: string[] = [];
  if (!c) err.push("Primero tiene que existir la constancia: el puente parte de evidencia.");
  if (!nombreCompleto(pu.coordinador)) err.push("El caso necesita un coordinador con nombre y apellido.");
  if (!largo(pu.puesto, LIM.puesto)) err.push("Elige un puesto vecino concreto.");
  const disp = new Set(evidenciasDisponibles(c, p).map((e) => e.id));
  if (!pu.evidencias.length) err.push("Liga el puesto al menos a una evidencia.");
  if (pu.evidencias.some((id) => !disp.has(id))) err.push("Hay una evidencia que no existe en el caso.");
  if (c && !pu.evidencias.some((id) => c.vistos.some((v) => v.id === id)))
    err.push("Al menos una evidencia tiene que ser algo que el tutor vio; lo autodeclarado solo no basta.");
  if (pu.demanda === "verificada") {
    if (!largo(pu.fuenteDemanda, LIM.fuenteDemanda)) err.push("Si la demanda es verificada, di cuál empleador u oportunidad y cómo lo verificaste.");
    if (!fechaValida(pu.verificadaEl) || dia(pu.verificadaEl) > dia(hoyISO(ahora))) err.push("Pon la fecha en que verificaste la demanda (no puede ser futura).");
  } else if (pu.demanda !== "ilustrativa") err.push("Indica si la demanda es verificada o ilustrativa.");
  if (!largo(pu.falta, LIM.falta)) err.push("Escribe la habilidad que falta, una sola y concreta.");
  if (!largo(pu.accion, LIM.accion)) err.push("Escribe la siguiente acción concreta para cerrar o demostrar esa habilidad.");
  if (!fechaValida(pu.fechaLimite)) err.push("Pon una fecha límite.");
  else {
    const d = (dia(pu.fechaLimite) - dia(hoyISO(ahora))) / 86400000;
    if (d < 0) err.push("La fecha límite no puede estar en el pasado.");
    if (d > LIM.plazoMaxDias) err.push("La fecha límite no puede pasar de 90 días: un plazo sin fin no es un plazo.");
  }
  if (!largo(pu.escalamiento, LIM.escalamiento)) err.push("Escribe qué pasa si nadie responde y cuándo se escala.");
  if (!nombreCompleto(pu.escalaA ?? "")) err.push("El escalamiento necesita una persona con nombre y apellido.");
  else if (normal(pu.escalaA) === normal(pu.coordinador)) err.push("Se escala a alguien distinto de quien lleva el caso.");
  for (const t of [pu.coordinador, pu.puesto, pu.fuenteDemanda, pu.falta, pu.accion, pu.escalamiento]) {
    const m = revisarTexto(t);
    if (m) { err.push(EXPLICACION_RECHAZO[m]); break; }
  }
  return err;
}

const RESULTADO_CON_EMPLEADOR: TipoResultado[] = ["invitacion", "entrevista", "prueba-pagada", "contratacion"];

export function validarResultado(r: Omit<Resultado, "id" | "registrado">, pu: Puente, c: Constancia | null, ahora: Date): string[] {
  const err: string[] = [];
  if (!pu.guardado) err.push("Primero guarda el caso.");
  if (!(r.tipo in RESULTADOS)) err.push("Tipo de resultado no válido.");
  if (RESULTADO_CON_EMPLEADOR.includes(r.tipo) && pu.demanda !== "verificada")
    err.push("Con un camino ilustrativo no puede haber invitación, entrevista ni contratación: primero verifica la demanda.");
  if (!fechaValida(r.fecha)) err.push("Pon la fecha del resultado.");
  else {
    if (dia(r.fecha) > dia(hoyISO(ahora))) err.push("No se registran resultados futuros.");
    if (c && dia(r.fecha) < dia(c.emitida.slice(0, 10))) err.push("El resultado no puede ser anterior a la constancia.");
  }
  if (!largo(r.evidencia, LIM.evidenciaResultado)) err.push("Describe la evidencia: qué la confirma (correo, mensaje, recibo) sin pegar datos personales.");
  if (!nombreCompleto(r.confirmadoPor)) err.push("¿Quién lo confirmó? Nombre y apellido.");
  /* Persona test, ronda 2: la coordinadora no puede confirmar su propio resultado. */
  else if (r.tipo !== "sin-respuesta" && normal(r.confirmadoPor) === normal(pu.coordinador))
    err.push("Un resultado lo confirma alguien distinto de quien lleva el caso (el empleador, el tutor u otra coordinadora).");
  const m = revisarTexto(r.evidencia) ?? revisarTexto(r.confirmadoPor);
  if (m) err.push(EXPLICACION_RECHAZO[m]);
  return err;
}

/** Cambios de estado permitidos. Ninguno depende de que exista la constancia. */
export const MOTIVOS_CIERRE: Record<MotivoCierre, string> = {
  transicion: "Consiguió prueba pagada o empleo (confirmado)",
  "sin-respuesta": "Nadie respondió",
  "ya-no-quiere": "La persona ya no quiere continuar",
  otro: "Otro motivo",
};

/** Cerrar exige motivo; "transición" solo si está confirmada. Los cerrados siguen en la cuenta. */
export function puedeCerrar(pu: Puente, motivo: MotivoCierre | "", ahora: Date): string | null {
  const m = puedeCambiarEstado(pu, "cerrado", ahora);
  if (m) return m;
  if (!motivo || !(motivo in MOTIVOS_CIERRE)) return "Para cerrar, elige el motivo.";
  if (motivo === "transicion" && !transicionConfirmada(pu)) return "No se cierra como transición sin una prueba pagada o contratación confirmada por otra persona.";
  return null;
}

export function puedeCambiarEstado(pu: Puente, a: EstadoCaso, ahora: Date): string | null {
  if (!pu.guardado) return "Primero guarda el caso.";
  if (a === "accion-hecha" && pu.estado !== "abierto") return "Solo un caso abierto puede marcar su acción como completada.";
  if (a === "sin-respuesta-escalado") {
    const vencido = fechaValida(pu.fechaLimite) && dia(pu.fechaLimite) < dia(hoyISO(ahora));
    if (!vencido && !pu.resultados.some((r) => r.tipo === "sin-respuesta")) return "Se escala cuando vence la fecha límite o se registra 'sin respuesta'.";
  }
  if (a === "cerrado" && !pu.resultados.length) return "No se cierra un caso sin registrar al menos un resultado, aunque sea 'sin respuesta'.";
  return null;
}

/** Éxito = prueba pagada o contratación confirmadas. Nunca la constancia sola. */
export function transicionConfirmada(pu: Puente | null): boolean {
  return Boolean(pu?.resultados.some((r) => r.tipo === "prueba-pagada" || r.tipo === "contratacion"));
}

/** La cuenta honesta: siempre con denominador y sin porcentajes inventados. */
export function cuentaHonesta(c: Constancia | null, pu: Puente | null): { etiqueta: string; valor: string }[] {
  const n = (b: boolean) => (b ? "1" : "0");
  const r = (t: TipoResultado) => n(Boolean(pu?.resultados.some((x) => x.tipo === t)));
  return [
    { etiqueta: "Casos en este dispositivo", valor: "1" },
    { etiqueta: "Con constancia emitida", valor: `${n(Boolean(c))} de 1 caso` },
    { etiqueta: "Con demanda verificada", valor: `${n(Boolean(pu?.guardado && pu.demanda === "verificada"))} de 1 caso` },
    { etiqueta: "Con entrevista confirmada por un tercero", valor: `${r("entrevista")} de 1 caso` },
    { etiqueta: "Con prueba pagada o contratación confirmada", valor: `${n(transicionConfirmada(pu))} de 1 caso` },
    { etiqueta: "Cerrados sin transición", valor: `${n(Boolean(pu?.estado === "cerrado" && !transicionConfirmada(pu)))} de 1 caso` },
  ];
}

export function codigoConstancia(rand: () => number = Math.random): string {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += abc[Math.floor(rand() * abc.length)];
  return `PV-${s.slice(0, 4)}-${s.slice(4)}`;
}

export function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export function fmtHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
