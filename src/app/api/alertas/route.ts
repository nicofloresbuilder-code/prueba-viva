import { NextResponse } from "next/server";
import { alertasSimuladas, promptAlertas, SISTEMA_ALERTAS, type EntradaAlertas } from "@/lib/ia";
import { LIM, revisarTexto, validarAlertas } from "@/lib/motor";
import { gemini, ipDe, permitido, validarEntradaIA } from "@/lib/servidor";

export async function POST(req: Request) {
  if (!permitido(ipDe(req))) return NextResponse.json({ error: "Demasiadas solicitudes. Espera unos minutos." }, { status: 429 });
  let body: Partial<EntradaAlertas>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 }); }
  const v = validarEntradaIA(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  if (!Array.isArray(body.preguntas) || body.preguntas.length !== LIM.preguntas || typeof body.notas !== "object" || !body.notas)
    return NextResponse.json({ error: "Faltan las preguntas o las notas de la defensa." }, { status: 400 });

  const preguntas = body.preguntas.map((p) => ({
    id: String(p?.id ?? "").slice(0, 4),
    texto: String(p?.texto ?? "").slice(0, 300),
    criterioId: String(p?.criterioId ?? "").slice(0, 12),
  }));
  const notas: Record<string, string> = {};
  for (const p of preguntas) {
    const n = String((body.notas as Record<string, unknown>)[p.id] ?? "").slice(0, LIM.notaDefensa[1]);
    if (revisarTexto(n)) return NextResponse.json({ error: "Una nota trae datos que no se pueden mandar." }, { status: 400 });
    notas[p.id] = n;
  }
  const datos: EntradaAlertas = { ...v.datos, preguntas, notas };

  const raw = await gemini(SISTEMA_ALERTAS, promptAlertas(datos));
  const alertas = raw ? validarAlertas(raw) : null;
  if (alertas) return NextResponse.json({ alertas, fuente: "gemini" });
  return NextResponse.json({ alertas: alertasSimuladas(datos), fuente: "simulado" });
}
