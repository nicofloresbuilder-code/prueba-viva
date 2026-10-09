/* Autoprueba del motor, sin navegador: npx tsx src/lib/__selftest.ts */

import { BITACORA_DEMO, ENCARGO_DEMO, NOTAS_DEMO } from "./demo";
import { alertasSimuladas, preguntasSimuladas } from "./ia";
import {
  codigoConstancia, construirConstancia, defensaCompleta, listoParaDefensa, MOTIVO_PRACTICA, nombreCompleto,
  respuestaTraeCalificacion, revisarTexto, validarAlertas, validarEncargo, validarEntrada, validarFirma, validarPreguntas,
} from "./motor";
import { canonico, deB64url, fragmento, sellar, sellosIguales } from "./sello";
import type { Defensa, Firma } from "./types";

let ok = 0;
let mal = 0;
function prueba(nombre: string, cond: boolean) {
  if (cond) ok++;
  else { mal++; console.error("FALLA:", nombre); }
}

/* Encargo */
prueba("el encargo de ejemplo es válido", validarEncargo(ENCARGO_DEMO).length === 0);
prueba("una práctica no genera constancia", validarEncargo({ ...ENCARGO_DEMO, origen: "practica" }).includes(MOTIVO_PRACTICA));
prueba("se exige quién necesitaba el trabajo", validarEncargo({ ...ENCARGO_DEMO, quienLoNecesitaba: "yo" }).length > 0);
prueba("mínimo 2 criterios", validarEncargo({ ...ENCARGO_DEMO, criterios: ["E1034-3"] }).length > 0);
prueba("máximo 6 criterios", validarEncargo({ ...ENCARGO_DEMO, criterios: ["E1034-1", "E1034-2", "E1034-3", "E1034-4", "E1035-1", "E1035-2", "E1035-3"] }).length > 0);
prueba("criterios de otro estándar se rechazan", validarEncargo({ ...ENCARGO_DEMO, criterios: ["E1034-3", "E0893-4"] }).length > 0);
prueba("criterios repetidos se rechazan", validarEncargo({ ...ENCARGO_DEMO, criterios: ["E1034-3", "E1034-3"] }).length > 0);
prueba("tutor con nombre de pila solo se rechaza", validarEncargo({ ...ENCARGO_DEMO, tutorNombre: "Rogelio" }).length > 0);
prueba("teléfono en el encargo se rechaza", validarEncargo({ ...ENCARGO_DEMO, quienLoNecesitaba: "Llamar a Rogelio al 55 1234 5678 para pedidos" }).length > 0);

/* Bitácora */
prueba("la bitácora de ejemplo está lista", listoParaDefensa(BITACORA_DEMO));
prueba("con 2 entradas no hay defensa", !listoParaDefensa(BITACORA_DEMO.slice(0, 2)));
prueba("IA sin propósito se rechaza", validarEntrada({ ...BITACORA_DEMO[0], usoIA: true, paraQueIA: "" }).length > 0);
prueba("IA con propósito se acepta", validarEntrada(BITACORA_DEMO[1]).length === 0);
prueba("decisión vacía se rechaza", validarEntrada({ ...BITACORA_DEMO[0], decision: "ok" }).length > 0);
prueba("contraseña en prosa se rechaza", revisarTexto("la contraseña del correo es Ferre2024!") === "contrasena");
prueba("CURP se rechaza", revisarTexto("mi curp es MAAR850101HDFRRG09") === "curp_rfc");
prueba("correo se rechaza", revisarTexto("escríbeme a dany@ejemplo.com") === "correo");
prueba("teléfono se rechaza", revisarTexto("tel 55-1234-5678") === "telefono");
prueba("llave de Google se rechaza", revisarTexto("AIzaSyA1234567890abcdefghijklmnopqrstu") === "api_key");
prueba("texto normal pasa", revisarTexto("Conté 38 pedidos y 9 sin respuesta; usé una hoja de cálculo.") === null);
prueba("cantidades y medidas pasan", revisarTexto("Tubo de 3/4 de pulgada, 12 piezas, total $1,450") === null);

/* IA: preguntas */
const crit = ENCARGO_DEMO.criterios;
const sim = preguntasSimuladas({ encargo: ENCARGO_DEMO.titulo, criterios: crit, bitacora: BITACORA_DEMO });
prueba("simulado da 5 preguntas", sim.length === 5);
prueba("simulado pasa la validación", validarPreguntas({ preguntas: sim }, crit)?.length === 5);
prueba("la pregunta 1 no repite el verbo decidir", !/decidiste "?decid/i.test(sim[0].texto));
prueba("simulado pregunta por la IA si se usó", sim.some((p) => /IA/.test(p.texto)));
prueba("menos de 5 preguntas se rechaza", validarPreguntas({ preguntas: sim.slice(0, 3) }, crit) === null);
prueba("pregunta sin signo de interrogación se rechaza", validarPreguntas({ preguntas: sim.map((p, i) => (i === 0 ? { ...p, texto: "Explica tu decisión de ordenar los pedidos." } : p)) }, crit) === null);
prueba("pregunta que menciona calificación se rechaza", validarPreguntas({ preguntas: sim.map((p, i) => (i === 0 ? { ...p, texto: "¿Qué calificación te pondrías del 1 al 10?" } : p)) }, crit) === null);
const conExtra = validarPreguntas({ preguntas: sim.map((p) => ({ ...p, puntaje: 9 })) }, crit);
prueba("campos extra como puntaje se descartan", !!conExtra && !respuestaTraeCalificacion(conExtra));
prueba("se detecta una respuesta con calificación", respuestaTraeCalificacion({ preguntas: [], calificacion: 8 }));
const ajenas = validarPreguntas({ preguntas: sim.map((p) => ({ ...p, criterioId: "E0893-1" })) }, crit);
prueba("criterios ajenos se reasignan a los del encargo", !!ajenas && ajenas.every((p) => crit.includes(p.criterioId)));

/* IA: alertas */
prueba("alertas válidas pasan", validarAlertas({ alertas: [{ tipo: "hueco", texto: "La respuesta 2 fue vaga, repregunta." }] })?.length === 1);
prueba("alerta con tipo inventado se descarta", validarAlertas({ alertas: [{ tipo: "aprobado", texto: "Está listo para el puesto." }] })?.length === 0);
prueba("alerta que dice apto se descarta", validarAlertas({ alertas: [{ tipo: "hueco", texto: "Es apto para atención a clientes." }] })?.length === 0);

/* Defensa y firma */
const defensa: Defensa = {
  preguntas: sim, fuente: "simulado", generadas: new Date().toISOString(),
  notas: Object.fromEntries(sim.map((p, i) => [p.id, NOTAS_DEMO[i]])), alertas: null, fuenteAlertas: null,
};
prueba("defensa con 5 notas está completa", defensaCompleta(defensa));
prueba("defensa con 3 notas no está completa", !defensaCompleta({ ...defensa, notas: { p1: NOTAS_DEMO[0], p2: NOTAS_DEMO[1], p3: NOTAS_DEMO[2] } }));
const alertas = alertasSimuladas({ encargo: ENCARGO_DEMO.titulo, criterios: crit, bitacora: BITACORA_DEMO, preguntas: sim, notas: defensa.notas });
prueba("con buenas notas no hay alerta de IA sin explicar", !alertas.some((a) => a.tipo === "ia-sin-explicar"));
const alertasVacias = alertasSimuladas({ encargo: ENCARGO_DEMO.titulo, criterios: crit, bitacora: BITACORA_DEMO, preguntas: sim, notas: { p1: "bien" } });
prueba("notas cortas y IA sin explicar generan alertas", alertasVacias.some((a) => a.tipo === "ia-sin-explicar") && alertasVacias.some((a) => a.tipo === "hueco"));

const firma: Firma = {
  nombreCompleto: "Rogelio Martínez", cargo: "Encargado de mostrador",
  vistos: { "E1034-3": "visto", "E1035-2": "visto", "E1036-1": "visto", "E1036-3": "no-visto" },
  nota: "Lo vi registrar y confirmar pedidos toda la semana; en la defensa explicó cada decisión sin leer.",
};
prueba("firma de ejemplo válida", validarFirma(firma, ENCARGO_DEMO, defensa).length === 0);
prueba("sin defensa no se firma", validarFirma(firma, ENCARGO_DEMO, null).length > 0);
prueba("firma de otra persona se rechaza", validarFirma({ ...firma, nombreCompleto: "Juan Pérez" }, ENCARGO_DEMO, defensa).length > 0);
prueba("firma sin acentos coincide igual", validarFirma({ ...firma, nombreCompleto: "rogelio martinez" }, ENCARGO_DEMO, defensa).length === 0);
prueba("criterio sin marcar se rechaza", validarFirma({ ...firma, vistos: { "E1034-3": "visto" } }, ENCARGO_DEMO, defensa).length > 0);
prueba("ningún criterio visto se rechaza", validarFirma({ ...firma, vistos: Object.fromEntries(crit.map((c) => [c, "no-visto" as const])) }, ENCARGO_DEMO, defensa).length > 0);
prueba("nota corta se rechaza", validarFirma({ ...firma, nota: "Todo bien." }, ENCARGO_DEMO, defensa).length > 0);
prueba("nombre completo exige apellido", nombreCompleto("Rogelio Martínez") && !nombreCompleto("Rogelio"));

/* Constancia y sello */
const c = construirConstancia(ENCARGO_DEMO, BITACORA_DEMO, defensa, firma, codigoConstancia(), new Date());
prueba("la constancia separa vistos de no vistos", c.vistos.length === 3 && c.noVistos.length === 1);
prueba("la constancia no lleva el texto de la bitácora", !canonico(c).includes("38 pedidos"));
prueba("la constancia cuenta las entradas con IA", c.bitacora.conIA === 1);
prueba("el código tiene formato PV-XXXX-XXXX", /^PV-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c.codigo));
const secreto = "secreto-de-prueba-que-no-es-real";
const s = sellar(c, secreto);
prueba("el sello es estable", s === sellar(JSON.parse(canonico(c)), secreto));
prueba("cambiar una letra rompe el sello", !sellosIguales(s, sellar({ ...c, alias: "Dany X." }, secreto)));
prueba("otra llave no reproduce el sello", !sellosIguales(s, sellar(c, "otra-llave")));
const [cuerpo, sello] = fragmento(c, s).split(".");
prueba("el enlace se puede leer de vuelta", JSON.parse(deB64url(cuerpo)).codigo === c.codigo && sello === s);

console.log(`${ok} aserciones correctas, ${mal} fallas`);
if (mal) process.exit(1);
