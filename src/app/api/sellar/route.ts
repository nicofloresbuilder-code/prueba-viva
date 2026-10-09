import { NextResponse } from "next/server";
import { codigoConstancia, construirConstancia, listoParaDefensa, validarEncargo, validarFirma } from "@/lib/motor";
import { fragmento, sellar } from "@/lib/sello";
import { ipDe, permitido } from "@/lib/servidor";
import type { Defensa, Encargo, EntradaBitacora, Firma } from "@/lib/types";

/* El servidor vuelve a correr TODAS las reglas antes de sellar. Lo que diga el
   navegador no basta: es la diferencia entre una promesa y una salvaguarda. */
export async function POST(req: Request) {
  if (!permitido(ipDe(req), 30)) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const secreto = process.env.FIRMA_SECRETA;
  if (!secreto || secreto.length < 24)
    return NextResponse.json({ error: "El sello del servidor no está configurado todavía (falta FIRMA_SECRETA)." }, { status: 503 });

  let b: { encargo: Encargo; bitacora: EntradaBitacora[]; defensa: Defensa; firma: Firma };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 }); }
  if (!b?.encargo || !Array.isArray(b?.bitacora) || !b?.defensa || !b?.firma)
    return NextResponse.json({ error: "Solicitud incompleta." }, { status: 400 });
  if (JSON.stringify(b).length > 40000) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });

  const errores = [
    ...validarEncargo(b.encargo),
    ...(listoParaDefensa(b.bitacora) ? [] : ["La bitácora no cumple las reglas."]),
    ...validarFirma(b.firma, b.encargo, b.defensa),
  ];
  if (errores.length) return NextResponse.json({ error: errores[0], errores }, { status: 422 });

  const c = construirConstancia(b.encargo, b.bitacora, b.defensa, b.firma, codigoConstancia(), new Date());
  return NextResponse.json({ constancia: c, fragmento: fragmento(c, sellar(c, secreto)) });
}
