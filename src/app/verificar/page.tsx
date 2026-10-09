import type { Metadata } from "next";
import Verificar from "@/components/Verificar";

export const metadata: Metadata = {
  title: "Verificar constancia · PRUEBA VIVA",
  description: "Comprueba que una constancia de PRUEBA VIVA es auténtica y no fue alterada.",
};

export default function Pagina() {
  return <Verificar />;
}
