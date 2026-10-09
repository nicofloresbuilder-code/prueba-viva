import { NextResponse } from "next/server";
import { hayLlave } from "@/lib/servidor";

/* Solo dice SI hay configuración; nunca devuelve los valores. */
export function GET() {
  return NextResponse.json({ ia: hayLlave() ? "gemini" : "simulado", sello: Boolean(process.env.FIRMA_SECRETA && process.env.FIRMA_SECRETA.length >= 24) });
}
