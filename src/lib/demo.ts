/* Caso de ejemplo. La ferretería, el tutor y el joven son INVENTADOS y así se
   etiquetan en pantalla. No hay datos de ninguna persona real. */

import type { Encargo, EntradaBitacora, Participante, Puente } from "./types";

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
  origen: "pagado",
  centroNombre: "Ferretería La Esperanza (ejemplo inventado)",
  centroTipo: "negocio-rfc",
  estandar: "EC0305",
  criterios: ["E1034-3", "E1035-2", "E1036-1", "E1036-3"],
  alias: "Dany R.",
  tutorNombre: "Rogelio Martínez",
  tutorCargo: "Encargado de mostrador",
  pago: "$1,500 MXN por la semana, los paga la ferretería al cerrar el encargo (monto de ejemplo)",
  alcance: "Una semana, de lunes a sábado, 4 horas diarias. Entra: registrar y contestar pedidos de WhatsApp. No entra: cobrar, entregar ni manejar caja.",
  rutaDisputa: "Si no está de acuerdo con la revisión o el pago, lo habla con la coordinadora de PUENTE MX antes de que se firme nada.",
  rutaReal: "no-se",
  mostradoAntes: true,
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

/** Participante de ejemplo: un primer empleo administrativo, sin historial formal. */
export const PARTICIPANTE_DEMO: Participante = {
  consiente: true,
  consentidoEn: hace(6, 9, 5),
  previas: [
    { id: "x1", tarea: "Llevé la lista de pedidos y cobros del puesto de comida de mi tía los fines de semana durante un año.", fuente: "testigo", informal: true },
    { id: "x2", tarea: "Hice una hoja de cálculo con los gastos del viaje de generación de mi prepa.", fuente: "muestra", informal: true },
  ],
};

/** Puente de ejemplo: la demanda es ILUSTRATIVA y así se etiqueta. */
export function puenteDemo(): Puente {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const z = (n: number) => String(n).padStart(2, "0");
  return {
    coordinador: "Laura Méndez",
    puesto: "Auxiliar administrativo",
    evidencias: ["E1035-2", "E1036-1", "x1"],
    demanda: "ilustrativa",
    fuenteDemanda: "",
    verificadaEl: "",
    falta: "Usar fórmulas básicas de hoja de cálculo para conciliar (BUSCARV o equivalente).",
    accion: "Hacer frente a la coordinadora una conciliación de 50 pedidos contra un corte de caja, con defensa en vivo de 10 minutos.",
    fechaLimite: `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`,
    escalamiento: "Si en la fecha límite no hay avance, la coordinadora lo revisa con el responsable de PUENTE MX esa misma semana.",
    estado: "abierto",
    resultados: [],
    guardado: false,
  };
}
