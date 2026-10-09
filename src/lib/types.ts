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
  creado: string;
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
  bitacora: { entradas: number; desde: string; hasta: string; conIA: number };
  defensa: { preguntas: number; fuente: FuenteIA };
}
