/* Utilidades solo del servidor: llamada a Gemini y límite de uso.
   La llave GEMINI_API_KEY vive en Vercel y nunca llega al navegador. */

import { revisarTexto, validarEntrada, LIM } from "./motor";
import type { EntradaPreguntas } from "./ia";

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const PREFERIDO = process.env.GEMINI_MODEL || "gemini-flash-latest";

export function hayLlave(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/* Bug del despliegue: el modelo fijo ("gemini-2.5-flash") respondió 404 porque
   Google retira modelos. Ahora, si el modelo pedido no existe, se pregunta a la
   API qué modelos "flash" hay disponibles para esta llave y se usa el primero. */
let modeloVigente: string | null = null;

async function elegirModelo(llave: string): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": llave } });
    if (!r.ok) return null;
    const j = await r.json();
    const nombres: string[] = (j?.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: { name: string }) => String(m.name).replace(/^models\//, ""));
    const flash = nombres.filter((n) => /flash/.test(n) && !/(image|tts|audio|live|exp|preview|latest)/.test(n));
    // Primero un Flash con versión fija (distinto del alias que pudo fallar), luego cualquiera.
    return flash.sort().reverse()[0] ?? nombres.find((n) => /flash/.test(n)) ?? null;
  } catch {
    return null;
  }
}

async function llamar(modelo: string, llave: string, sistema: string, usuario: string, signal: AbortSignal): Promise<Response> {
  return fetch(`${BASE}/models/${modelo}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": llave },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      contents: [{ role: "user", parts: [{ text: usuario }] }],
      generationConfig: {
        responseMimeType: "application/json", temperature: 0.4, maxOutputTokens: 4096,
        // En 2.5 Flash se apaga el "pensamiento" para que no se coma los tokens de la respuesta.
        ...(/2\.5-flash/.test(modelo) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }),
    signal,
  });
}

/** Llama a Gemini pidiendo JSON. Devuelve el objeto o null si algo falla. */
export async function gemini(sistema: string, usuario: string): Promise<unknown | null> {
  const llave = process.env.GEMINI_API_KEY;
  if (!llave) return null;
  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), 25000);
  try {
    let modelo = modeloVigente ?? PREFERIDO;
    let r = await llamar(modelo, llave, sistema, usuario, ctrl.signal);
    /* En producción, gemini-flash-latest respondió 503 (saturado). Se reintenta
       una vez y, si sigue saturado, se prueba con otro modelo Flash. */
    if (r.status === 503 || r.status === 429 || r.status === 500) {
      await new Promise((ok) => setTimeout(ok, 1500));
      r = await llamar(modelo, llave, sistema, usuario, ctrl.signal);
    }
    if (r.status === 404 || r.status === 400 || r.status === 503 || r.status === 500) {
      const otro = await elegirModelo(llave);
      console.error(`Gemini respondió ${r.status} con ${modelo}; se intenta con ${otro}`);
      if (otro && otro !== modelo) {
        modelo = otro;
        r = await llamar(modelo, llave, sistema, usuario, ctrl.signal);
      }
    }
    if (!r.ok) {
      console.error("Gemini respondió", r.status, "con", modelo);
      return null;
    }
    modeloVigente = modelo;
    const j = await r.json();
    const texto: string | undefined = j?.candidates?.[0]?.content?.parts?.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? "").join("");
    if (!texto) return null;
    return JSON.parse(texto.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch (e) {
    console.error("Gemini falló:", (e as Error).name);
    return null;
  } finally {
    clearTimeout(reloj);
  }
}

/* Límite sencillo por IP para no quemar la cuota gratuita. Vive en memoria
   de cada instancia: suficiente para una rebanada, no para producción. */
const visitas = new Map<string, number[]>();
export function permitido(ip: string, max = 20, ventanaMs = 10 * 60 * 1000): boolean {
  const ahora = Date.now();
  const lista = (visitas.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
  if (lista.length >= max) return false;
  lista.push(ahora);
  visitas.set(ip, lista);
  return true;
}

export function ipDe(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** Valida en el servidor lo que viene del navegador antes de mandarlo al modelo. */
export function validarEntradaIA(body: unknown): { ok: true; datos: EntradaPreguntas } | { ok: false; error: string } {
  const b = body as Partial<EntradaPreguntas>;
  if (!b || typeof b.encargo !== "string" || !Array.isArray(b.criterios) || !Array.isArray(b.bitacora))
    return { ok: false, error: "Solicitud incompleta." };
  if (b.encargo.length < 8 || b.encargo.length > 120) return { ok: false, error: "Encargo con largo no válido." };
  if (b.criterios.length < LIM.criteriosMin || b.criterios.length > LIM.criteriosMax || b.criterios.some((c) => typeof c !== "string" || c.length > 12))
    return { ok: false, error: "Criterios no válidos." };
  if (b.bitacora.length < LIM.entradasMin || b.bitacora.length > LIM.entradasMax) return { ok: false, error: "La bitácora necesita de 3 a 30 entradas." };
  const bitacora = b.bitacora.map((x) => ({
    t: String(x?.t ?? "").slice(0, 40),
    que: String(x?.que ?? ""),
    decision: String(x?.decision ?? ""),
    usoIA: Boolean(x?.usoIA),
    paraQueIA: String(x?.paraQueIA ?? ""),
  }));
  for (const x of bitacora) if (validarEntrada(x).length) return { ok: false, error: "Hay una entrada de bitácora que no cumple las reglas." };
  if (revisarTexto(b.encargo)) return { ok: false, error: "El encargo trae datos que no se pueden mandar." };
  return { ok: true, datos: { encargo: b.encargo, criterios: b.criterios, bitacora } };
}
