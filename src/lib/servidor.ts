/* Utilidades solo del servidor: llamada a Gemini y límite de uso.
   La llave GEMINI_API_KEY vive en Vercel y nunca llega al navegador. */

import { revisarTexto, validarEntrada, LIM } from "./motor";
import type { EntradaPreguntas } from "./ia";

const MODELO = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function hayLlave(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Llama a Gemini pidiendo JSON. Devuelve el objeto o null si algo falla. */
export async function gemini(sistema: string, usuario: string): Promise<unknown | null> {
  const llave = process.env.GEMINI_API_KEY;
  if (!llave) return null;
  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": llave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: "user", parts: [{ text: usuario }] }],
        generationConfig: {
          responseMimeType: "application/json", temperature: 0.4, maxOutputTokens: 4096,
          // Sin "pensamiento": la tarea es corta y así no se come los tokens de la respuesta.
          ...(MODELO.includes("2.5-flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.error("Gemini respondió", r.status);
      return null;
    }
    const j = await r.json();
    const texto: string | undefined = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
    if (!texto) return null;
    return JSON.parse(texto);
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
