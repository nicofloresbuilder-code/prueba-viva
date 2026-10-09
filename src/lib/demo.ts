/* Caso de ejemplo. La ferretería, el tutor y el joven son INVENTADOS y así se
   etiquetan en pantalla. No hay datos de ninguna persona real. */

import type { Encargo, EntradaBitacora } from "./types";

const hoy = new Date();
const hace = (dias: number, h: number, m: number) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() - dias);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const ENCARGO_DEMO: Encargo = {
  titulo: "Ordenar y dar seguimiento a los pedidos que llegan por WhatsApp durante una semana",
  quienLoNecesitaba: "La ferretería perdía pedidos de clientes que escribían por WhatsApp y nadie anotaba. Don Rogelio necesitaba que cada pedido quedara registrado y contestado.",
  origen: "jcf",
  centroNombre: "Ferretería La Esperanza (ejemplo inventado)",
  centroTipo: "jcf",
  estandar: "EC0305",
  criterios: ["E1034-3", "E1035-2", "E1036-1", "E1036-3"],
  alias: "Dany R.",
  tutorNombre: "Rogelio Martínez",
  tutorCargo: "Encargado de mostrador",
  creado: hace(6, 9, 0),
};

export const BITACORA_DEMO: EntradaBitacora[] = [
  {
    id: "b1", t: hace(6, 10, 15),
    que: "Revisé los chats de WhatsApp de la semana pasada y conté 38 pedidos; 9 nunca se contestaron.",
    decision: "Decidí empezar por los 9 sin respuesta antes de ordenar todo, porque eran clientes esperando.",
    usoIA: false, paraQueIA: "",
  },
  {
    id: "b2", t: hace(5, 11, 40),
    que: "Armé una hoja con columnas: fecha, cliente (solo nombre de pila), producto, cantidad, estado y quién lo atendió.",
    decision: "Quité la columna de teléfono porque ya está en WhatsApp y no quería copiar datos de clientes a otro lado.",
    usoIA: true, paraQueIA: "Le pedí a ChatGPT ideas de columnas para un registro de pedidos; quité tres que no servían aquí.",
  },
  {
    id: "b3", t: hace(3, 13, 5),
    que: "Contesté los pedidos del día con un mensaje que confirma producto, cantidad y hora de entrega, y los registré en la hoja.",
    decision: "Empecé a repetir el pedido al cliente antes de confirmarlo, porque dos veces entendí mal la medida de un tubo.",
    usoIA: false, paraQueIA: "",
  },
  {
    id: "b4", t: hace(1, 17, 30),
    que: "Al cerrar cada pedido le pregunté al cliente si llegó completo y le dejé el número de la tienda para quejas.",
    decision: "Marqué como 'cerrado' solo los pedidos donde el cliente confirmó; los demás se quedan 'por confirmar'.",
    usoIA: false, paraQueIA: "",
  },
];

/** Notas de ejemplo para la defensa (solo para la demostración). */
export const NOTAS_DEMO = [
  "Explicó que los 9 sin respuesta eran clientes ya molestos y que ordenar primero los habría hecho esperar otro día.",
  "Contó cómo armó la hoja y que lo más difícil fue que algunos clientes mandan audios y hay que escucharlos completos.",
  "Dijo que la IA le sugirió columnas de precio y descuento y las quitó porque los precios cambian y no los maneja él.",
  "Revisa al final del día que ningún chat quede sin palomita azul de respuesta, y compara contra la hoja.",
  "Repite el pedido al cliente antes de confirmar; lo empezó a hacer después de equivocarse con una medida.",
];
