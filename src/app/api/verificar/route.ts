import { NextResponse } from "next/server";
import { deB64url, sellar, sellosIguales } from "@/lib/sello";
import { ipDe, permitido } from "@/lib/servidor";
import type { Constancia } from "@/lib/types";

export async function POST(req: Request) {
  if (!permitido(ipDe(req), 60)) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const secreto = process.env.FIRMA_SECRETA;
  if (!secreto) return NextResponse.json({ error: "La verificación no está configurada." }, { status: 503 });
  let f: string;
  try { f = String((await req.json())?.fragmento ?? ""); } catch { return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 }); }
  if (f.length > 12000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(f)) return NextResponse.json({ autentica: false, motivo: "El enlace está incompleto o mal copiado." });
  const [cuerpo, sello] = f.split(".");
  let c: Constancia;
  try { c = JSON.parse(deB64url(cuerpo)); } catch { return NextResponse.json({ autentica: false, motivo: "El enlace está incompleto o mal copiado." }); }
  if (c?.v !== 1) return NextResponse.json({ autentica: false, motivo: "Formato de constancia desconocido." });
  const autentica = sellosIguales(sello, sellar(c, secreto));
  return NextResponse.json(autentica ? { autentica, constancia: c } : { autentica, motivo: "El sello no coincide: la constancia fue alterada o no salió de PRUEBA VIVA." });
}
