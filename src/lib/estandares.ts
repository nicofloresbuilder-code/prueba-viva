/* Estándares de Competencia de CONOCER, publicados en el Diario Oficial de la
   Federación. Son la parte "estructurada y verificada" del stack: los criterios
   no los inventa esta app ni el modelo; vienen del documento oficial (aquí
   resumidos en lenguaje llano, con el código de cada elemento).
   Elegí dos de los puestos de entrada que la IA está desplazando primero:
   atención a clientes y venta telefónica. */

export interface Elemento {
  codigo: string;
  nombre: string;
  criterios: { id: string; texto: string }[];
}

export interface Estandar {
  codigo: string;
  titulo: string;
  nivel: number;
  dof: string;
  fuente: string;
  elementos: Elemento[];
}

export const ESTANDARES: Estandar[] = [
  {
    codigo: "EC0305",
    titulo: "Prestación de servicios de atención a clientes",
    nivel: 2,
    dof: "12 de diciembre de 2012",
    fuente: "https://icate.bcs.gob.mx/wp-content/uploads/2019/10/EC0305-Prestacion-de-servicios-de-atencion-a-clientes.pdf",
    elementos: [
      {
        codigo: "E1034",
        nombre: "Atender los requerimientos del cliente",
        criterios: [
          { id: "E1034-1", texto: "Prepara el área de servicio antes de empezar: ordenada, con materiales listos y medios de comunicación funcionando." },
          { id: "E1034-2", texto: "Abre el contacto con un saludo según el horario y los lineamientos del negocio, y se presenta." },
          { id: "E1034-3", texto: "Identifica la necesidad del cliente con preguntas específicas y confirma lo que pidió." },
          { id: "E1034-4", texto: "Elige el canal de comunicación adecuado y le dice al cliente cuál se usará." },
        ],
      },
      {
        codigo: "E1035",
        nombre: "Gestionar el servicio requerido por el cliente",
        criterios: [
          { id: "E1035-1", texto: "Recaba los datos que el servicio requiere y menciona el aviso de privacidad." },
          { id: "E1035-2", texto: "Registra la información en el formato o sistema del negocio, la coteja con la fuente y la mantiene en orden." },
          { id: "E1035-3", texto: "Informa sobre productos, servicios y beneficios, y canaliza al área correcta cuando hace falta." },
          { id: "E1035-4", texto: "Conserva los documentos físicos y electrónicos completos y ordenados." },
        ],
      },
      {
        codigo: "E1036",
        nombre: "Obtener la satisfacción del servicio al cliente",
        criterios: [
          { id: "E1036-1", texto: "Verifica con el cliente si su solicitud quedó resuelta." },
          { id: "E1036-2", texto: "Explica el procedimiento de quejas y sugerencias." },
          { id: "E1036-3", texto: "Cierra ofreciendo ayuda adicional y se despide según los lineamientos." },
        ],
      },
    ],
  },
  {
    codigo: "EC0254",
    titulo: "Venta de productos y servicios vía telefónica",
    nivel: 2,
    dof: "18 de octubre de 2012",
    fuente: "https://www.ilce.edu.mx/images/certificaciones/competencias/estandares/EC0254.pdf",
    elementos: [
      {
        codigo: "E0982",
        nombre: "Preparar las herramientas de trabajo",
        criterios: [
          { id: "E0982-1", texto: "Verifica que cuenta con las herramientas que el negocio le da para operar." },
          { id: "E0982-2", texto: "Se da de alta en los sistemas asignados y se marca disponible para recibir o hacer llamadas." },
        ],
      },
      {
        codigo: "E0893",
        nombre: "Interactuar con el cliente para promover y vender vía telefónica",
        criterios: [
          { id: "E0893-1", texto: "Abre la llamada con el protocolo del negocio y la terminología de la campaña." },
          { id: "E0893-2", texto: "Hace preguntas para identificar necesidades y resuelve dudas sobre beneficios." },
          { id: "E0893-3", texto: "Comunica las ventajas del producto o servicio de forma clara y precisa." },
          { id: "E0893-4", texto: "Atiende las objeciones del cliente y hace al menos un intento de cierre." },
          { id: "E0893-5", texto: "Captura y actualiza los datos del cliente en el instrumento de trabajo." },
          { id: "E0893-6", texto: "Cierra ofreciendo apoyo adicional, agradece y se despide según el protocolo." },
        ],
      },
    ],
  },
];

export function estandar(codigo: string): Estandar | undefined {
  return ESTANDARES.find((e) => e.codigo === codigo);
}

export function criterio(id: string): { estandar: Estandar; elemento: Elemento; texto: string } | undefined {
  for (const e of ESTANDARES)
    for (const el of e.elementos) {
      const c = el.criterios.find((x) => x.id === id);
      if (c) return { estandar: e, elemento: el, texto: c.texto };
    }
  return undefined;
}
