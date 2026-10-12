import { NextResponse } from "next/server";
import { preguntasSimuladas, promptPreguntas, SISTEMA_PREGUNTAS } from "@/lib/ia";
import { validarPreguntas } from "@/lib/motor";
import { gemini, ipDe, permitido, validarEntradaIA } from "@/lib/servidor";

export async function POST(req: Request) {
  if (!permitido(ipDe(req))) return NextResponse.json({ error: "Demasiadas solicitudes. Espera unos minutos." }, { status: 429 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 }); }
  const v = validarEntradaIA(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  // Si el participante no autorizó la IA, su bitácora no sale al modelo.
  const sinIA = Boolean((body as { sinIA?: unknown })?.sinIA);
  const raw = sinIA ? null : await gemini(SISTEMA_PREGUNTAS, promptPreguntas(v.datos));
  const preguntas = raw ? validarPreguntas(raw, v.datos.criterios) : null;
  if (preguntas) return NextResponse.json({ preguntas, fuente: "gemini" });

  return NextResponse.json({
    preguntas: preguntasSimuladas(v.datos),
    fuente: "simulado",
    motivo: raw ? "La respuesta del modelo no pasó la validación." : "No hay llave de Gemini configurada o el modelo no respondió.",
  });
}
