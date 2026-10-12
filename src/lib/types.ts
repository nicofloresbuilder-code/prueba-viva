export type TipoCentro = "jcf" | "negocio-rfc" | "negocio-sin-registro" | "otro";
export type Origen = "pagado" | "jcf" | "practica";

export interface Encargo {
  titulo: string;
  quienLoNecesitaba: string;
  origen: Origen;
  centroNombre: string;
  centroTipo: TipoCentro;
  estandar: string;
  criterios: string[];
  alias: string;
  tutorNombre: string;
  tutorCargo: string;
  /* Blueprint PUENTE MX, paso 1: se declara ANTES de empezar el trabajo. */
  pago: string;
  alcance: string;
  rutaDisputa: string;
  rutaReal: "verificada" | "no" | "no-se";
  mostradoAntes: boolean;
  creado: string;
}

/* Blueprint, paso 2: intake del participante, con consentimiento. */
export type FuenteEvidencia = "autodeclarada" | "muestra" | "testigo";
export interface TareaPrevia {
  id: string;
  tarea: string;
  fuente: FuenteEvidencia;
  informal: boolean;
}
export interface Participante {
  consiente: boolean;
  consentidoEn: string;
  previas: TareaPrevia[];
}

/* Blueprint, pasos 5 a 7: el puente del operador (rol de Regina). */
export type TipoDemanda = "verificada" | "ilustrativa";
export type EstadoCaso = "abierto" | "accion-hecha" | "sin-respuesta-escalado" | "cerrado";
export type TipoResultado = "invitacion" | "entrevista" | "prueba-pagada" | "contratacion" | "sin-respuesta";

export interface Resultado {
  id: string;
  tipo: TipoResultado;
  fecha: string;
  evidencia: string;
  confirmadoPor: string;
  registrado: string;
}

export interface Puente {
  coordinador: string;
  puesto: string;
  evidencias: string[];
  demanda: TipoDemanda;
  fuenteDemanda: string;
  verificadaEl: string;
  falta: string;
  accion: string;
  fechaLimite: string;
  escalamiento: string;
  estado: EstadoCaso;
  resultados: Resultado[];
  guardado: boolean;
}

export interface EntradaBitacora {
  id: string;
  t: string;
  que: string;
  decision: string;
  usoIA: boolean;
  paraQueIA: string;
}

export interface Pregunta {
  id: string;
  texto: string;
  criterioId: string;
  porQue: string;
}

export type TipoAlerta = "contradiccion" | "hueco" | "ia-sin-explicar";

export interface Alerta {
  tipo: TipoAlerta;
  texto: string;
}

/** Lo que el tutor marca con un toque por pregunta. Es juicio humano, no de la IA. */
export type Marca = "bien" | "dudo" | "no-supo";

export type FuenteIA = "gemini" | "simulado";

export interface Defensa {
  preguntas: Pregunta[];
  fuente: FuenteIA;
  generadas: string;
  notas: Record<string, string>;
  marcas: Record<string, Marca>;
  alertas: Alerta[] | null;
  fuenteAlertas: FuenteIA | null;
}

export type Visto = "visto" | "no-visto";

export interface Firma {
  nombreCompleto: string;
  cargo: string;
  vistos: Record<string, Visto>;
  nota: string;
}

/** Lo único que viaja en el enlace de la constancia. Sin bitácora, sin notas. */
export interface Constancia {
  v: 1;
  codigo: string;
  emitida: string;
  alias: string;
  encargo: string;
  quienLoNecesitaba: string;
  origen: Exclude<Origen, "practica">;
  centro: { nombre: string; tipo: TipoCentro };
  estandar: { codigo: string; titulo: string; dof: string };
  vistos: { id: string; texto: string }[];
  noVistos: { id: string; texto: string }[];
  tutor: { nombre: string; cargo: string };
  nota: string;
  pago: string;
  bitacora: { entradas: number; desde: string; hasta: string; conIA: number };
  defensa: { preguntas: number; fuente: FuenteIA };
}
