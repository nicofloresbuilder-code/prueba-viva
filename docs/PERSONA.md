# PERSONA TEST — PRUEBA VIVA

**Módulo de primera prueba de PUENTE MX · Semana 9 · Nicolás Flores**

Hubo dos rondas. La primera probó las cuatro pantallas originales. La segunda se hizo después de integrar el Blueprint del equipo (pago y condiciones antes de empezar, consentimiento, el paso 5 de la coordinadora y la cuenta honesta).

# Ronda 1

## Cómo se hizo

Abrí un chat nuevo con un usuario sintético. Le di las capturas de cada pantalla, en celular (390 px) y en orden: encargo vacío, encargo lleno, bitácora, defensa, firma y constancia. Le pedí que intentara la tarea como cada persona, narrando en voz alta dónde dudaba, qué no entendía y dónde se rendía. Usé tres personas porque el producto tiene tres usuarios distintos.

| Persona | Quién es | Qué hace en la app |
|---|---|---|
| **Don Rogelio, 52** | Encargado de una ferretería en Iztapalapa que recibe aprendices de JCF. Usa WhatsApp todo el día, solo tiene celular, lee despacio, desconfía de todo lo que parezca trámite y se rinde en silencio cuando se confunde. | Tutor: crea el encargo, conduce la defensa y firma. |
| **Dany, 19** | Aprendiz. Terminó la prepa y quiere entrar a un call center o a recepción. Es impaciente y le preocupa que usar ChatGPT "le cuente en contra". | Llena la bitácora, defiende y recibe la constancia. |
| **Lic. Mariana Soto, 34** | Reclutadora de un call center en la CDMX. Recibe el enlace por WhatsApp entre 80 candidatos y le da 40 segundos a cada uno. | Solo ve la constancia. |

## Dónde se perdieron

| # | Persona | Pantalla | Qué lo confundió | Severidad |
|---|---|---|---|---|
| 1 | Rogelio | Encargo | Etiquetas "IA: SIMULADO (SIN LLAVE)", "SELLO: ACTIVO", "SIN CUENTAS…": "esto parece del SAT, ¿qué llave me falta?" | media |
| 2 | Rogelio | Encargo | Once casillas con claves E1034-1… y "Elige de 2 a 6 criterios que este encargo permite ver": "ni le entiendo; aquí lo dejo". **Abandona.** | **alta** |
| 3 | Rogelio | Encargo | El selector del estándar salía cortado: "EC0305 · Prestación de servicios de a…" | media |
| 4 | Rogelio | Encargo | "sin fingir que se verificó": lo lee como desconfianza hacia él | baja |
| 5 | Dany | Bitácora | "4 de 3 entradas mínimas" suena a error | baja |
| 6 | Dany | Bitácora | Horas de madrugada (04:15 a. m.) en la bitácora de ejemplo: "van a pensar que inventé todo" | media |
| 7 | Dany | Bitácora y constancia | La etiqueta roja "Usé IA para…": "eso me quema" | media |
| 8 | Rogelio | Defensa | Cinco cajas de texto para escribir con el pulgar, y un botón gris "Ir a la firma" sin decir por qué está bloqueado | **alta** |
| 9 | Rogelio | Firma | Tiene que volver a escribir su nombre y cargo, y le da miedo equivocarse en un acento | media |
| 10 | Rogelio | Firma | El botón rojo "Firmar y sellar" se siente como compromiso legal | baja |
| 11 | Dany y Mariana | Constancia | Un muro de URL ("…/verificar#eyJ…") arriba de la tarjeta: "¿esto es mi constancia?", "¿es phishing?" | **alta** |
| 12 | Dany | Constancia | "CRITERIOS QUE EL TUTOR NO VIO": siente que lo exhibe | media |
| 13 | Mariana | Constancia | "generador simulado" se lee como "esto es falso" | alta |
| 14 | Mariana | Constancia | Lo que decide (quién firmó, cuánto duró) estaba abajo; en 40 segundos no llega | **alta** |
| 15 | Mariana | Constancia | El folio y el sello no le dan autoridad porque no conoce la marca | media |

**Lo peor:** Don Rogelio abandonó en la primera pantalla. Si el tutor no llega a firmar, no hay constancia.

## Qué cambié

| # | Cambio | Confusiones que ataca |
|---|---|---|
| 1 | **La constancia ahora empieza por lo que decide:** nombre, trabajo, duración y número de registros, y luego "Lo vio y firma" con el nombre, el cargo y la cita del tutor. La URL ya no se muestra (queda detrás de "Copiar enlace" y "Mandar por WhatsApp"). Los límites quedan en un desplegable que sigue visible. | 11, 14 |
| 2 | "Criterios que el tutor NO vio" → **"No se observó en este encargo"**. Dice lo mismo, pero no suena a castigo. | 12 |
| 3 | En la constancia, "generador simulado" → "plantilla automática (modo sin IA)". Sigue etiquetado, pero sin sonar a falso. | 13 |
| 4 | **Defensa de un toque:** por pregunta, tres botones (Lo explicó bien / Dudó / No supo). La nota escrita ahora es opcional, y debajo del botón bloqueado aparece "te faltan N". | 8 |
| 5 | El estándar ahora se elige con tarjetas que muestran el título completo ("¿A qué se parece más este trabajo?"). La ayuda dice: "Palomea lo que vas a poder ver con tus propios ojos". | 2, 3 |
| 6 | Las etiquetas técnicas del encabezado pasaron a lenguaje llano ("Preguntas en modo sin IA"). La del sello solo aparece si falta configurarlo. | 1 |
| 7 | La firma viene prellenada con el nombre y el cargo del encargo; solo hay que revisarlos. | 9 |
| 8 | "4 entradas (mínimo 3) ✓". La etiqueta de IA pasó de rojo a ámbar, y la constancia dice que declarar la IA "es lo que pide la regla". | 5, 7 |
| 9 | **Bug real:** las horas se forzaban a la zona de la CDMX, pero el ejemplo se generaba con la hora del dispositivo. Ahora todo usa la hora local del dispositivo. | 6 |

## Lo que no cambié, y por qué

- **El contacto del tutor en la constancia** (lo pidió Mariana). Un teléfono o un correo en un enlace que circula por WhatsApp expone a una persona. La verificación la da el sello; si la empresa quiere hablar con el tutor, se lo pide al joven.
- **"No se observó en este encargo" sigue en la constancia.** Dany preferiría esconderlo, pero eso es justo lo que la hace creíble.
- **El apellido completo del joven.** Lo decide el joven. Un alias con inicial basta para cruzarlo con su CV.
- **El botón rojo de firmar.** Firmar sí es un compromiso, y la casilla de confirmación lo dice con todas sus letras.

---

# Ronda 2 · Después del Blueprint PUENTE MX

## Cómo se hizo

Abrí un chat nuevo con un usuario sintético y le di cinco capturas en celular: el encargo con lo que se declara antes de empezar, la bitácora con el consentimiento, la constancia con la entrega a la coordinadora, el formulario del paso 5 y el caso abierto con su cuenta honesta.

| Persona | Quién es | Qué revisa |
|---|---|---|
| **Dany, 20** | El usuario que define el Blueprint: vive en la CDMX, terminó la prepa, nunca ha tenido empleo formal y busca su primer puesto administrativo. Teme que lo "exhiban". | Consentimiento, constancia y caso |
| **Laura, 38** | Coordinadora de PUENTE MX (el rol de operadora). Lleva unos 40 casos, odia el papeleo que no mueve a nadie, y la audita una compañera adversaria que odia las tasas de éxito falsas. | Paso 5 y caso |
| **Don Rogelio, 52** | El tutor de la ronda 1. | Lo que declara antes de empezar |

## Dónde se perdieron

| # | Persona | Pantalla | Qué lo confundió | Severidad |
|---|---|---|---|---|
| 1 | Rogelio | Encargo | El pago salía cortado ("…los pag") en un campo de una sola línea | alta |
| 2 | Rogelio | Encargo | La ruta de reclamo la escribe el mismo tutor: "¿se queja de mí conmigo?" | alta |
| 3 | Rogelio | Encargo | Solo el tutor confirma que "lo mostró"; el joven nunca confirma que lo vio | media |
| 4 | Rogelio | Encargo | "No sé todavía" no lleva fecha ni condición | baja |
| 5 | Dany | Bitácora | La casilla de consentimiento venía marcada y gris: "dice que es mía, pero no me preguntan nada" | **alta** |
| 6 | Dany | Bitácora | "la constancia solo lleva lo que yo decida compartir", pero no ve dónde se decide | alta |
| 7 | Dany | Bitácora | "Lo dice el participante (no verificado)" en tercera persona y con tono de sospecha | media |
| 8 | Dany | Bitácora | "Hay una muestra de trabajo", pero no hay dónde subirla | media |
| 9 | Dany | Bitácora | **Bug:** "Decidí: Decidí empezar…" | baja |
| 10 | Dany | Constancia | "NO SE OBSERVÓ" justo arriba de "Mandar por WhatsApp": "me exhiben" | alta |
| 11 | Dany | Constancia | "criterios oficiales" contra "no emite certificaciones oficiales": ¿es oficial o no? | media |
| 12 | Dany | Constancia | "Pasar al siguiente paso" parecía para ella y abría el formulario de otra persona | media |
| 13 | Laura | Paso 5 | "Casos en este navegador": "si borro caché o me auditan desde otra compu, no existe" | alta |
| 14 | Laura | Paso 5 | Puede dejar sin marcar algo observado y marcar algo no verificado | media |
| 15 | Laura | Paso 5 | No veía el campo de fuente al elegir "Verificada" (sí aparece al elegirla: confirmado en el pase mecánico) | — |
| 16 | Laura | Paso 5 | "lo revisa con el responsable de PUENTE MX": ¿cuál responsable? | media |
| 17 | Laura | Paso 5 | Fecha en formato de EE. UU. (lo controla el navegador) | baja |
| 18 | Laura | Caso | "¿Quién lo confirmó?" ya traía su propio nombre: "yo abro, yo actúo y yo confirmo" | **alta** |
| 19 | Laura | Caso | "Cerrar caso" no pedía motivo: un fracaso podía desaparecer | **alta** |
| 20 | Laura | Cuenta | "1 de 1": ¿uno de qué? | media |
| 21 | Dany | Caso | "Hacer frente a la coordinadora…" suena a pelearse con ella | media |
| 22 | Dany | Caso | No tiene una vista propia ni cómo hablar con la coordinadora | alta |

**Lo peor:** la coordinadora era juez y parte. Abría el caso, confirmaba su propio resultado y podía cerrarlo sin motivo. Con eso la cuenta honesta no resiste una auditoría.

## Qué cambié

| # | Cambio | Ataca |
|---|---|---|
| 1 | **Nadie confirma su propio resultado:** si la coordinadora escribe su nombre en "¿quién lo confirmó?", se rechaza (salvo "sin respuesta"). El campo empieza vacío. | 18 |
| 2 | **Cerrar exige motivo.** "Transición" solo se acepta si hay una prueba pagada o contratación confirmada por otra persona. Los casos cerrados siguen en la cuenta ("Cerrados sin transición: x de 1 caso"). | 19 |
| 3 | El escalamiento exige el nombre de otra persona, distinta de la coordinadora. | 16 |
| 4 | Aviso "Este caso solo existe en este dispositivo" y botón para descargar el caso en JSON y auditarlo. | 13 |
| 5 | Denominadores con nombre: "x de 1 caso". | 20 |
| 6 | **Consentimiento en tres casillas que empiezan vacías:** "vi las condiciones" y "mi tutor puede leer mi bitácora" son obligatorias; "la IA puede leerla" es opcional. Si dice que no, nada se manda al modelo y las preguntas salen de plantilla, etiquetadas. | 5 |
| 7 | **El joven ve el pago, el alcance y la ruta de reclamo** antes de su bitácora, y confirma que los vio. | 3 |
| 8 | Ruta neutral fija: "también puedes escribir a la coordinación de PUENTE MX; tu tutor no ve tu queja". | 2 |
| 9 | Pago, alcance y ruta de reclamo en cajas de varias líneas: ya no se cortan. | 1 |
| 10 | Fuentes en lenguaje neutro: "Autodeclarado (no verificado)", "Hay alguien que lo vio (no verificado)". | 7 |
| 11 | "No se observó" → "Aún no se observó en este encargo", y "criterios oficiales" → "criterios tomados de CONOCER". | 10, 11 |
| 12 | **Bug:** la bitácora decía "Decidí: Decidí…"; ahora dice "Decisión:". | 9 |
| 13 | "Hacer frente a" → "Hacer, con la coordinadora presente,". | 21 |
| 14 | El botón ahora dice "Entregar a la coordinadora de PUENTE MX", con un texto para el joven sobre lo que sigue. | 12 |

**Bug encontrado en el pase mecánico después de estos cambios:** la bitácora se abría aunque el joven no hubiera confirmado las condiciones. Corregido y probado de nuevo.

## Lo que no cambié, y por qué

- **Ocultar "aún no se observó" en la versión para empleadores** (#6, #10). La constancia está sellada: si se quita una parte, el sello se rompe. Además, decir lo que no se vio es lo que la hace creíble. Cambié el tono, no el contenido.
- **Subir archivos** (#8). Para eso haría falta un servidor que guarde datos personales. Queda para el piloto, con autenticación.
- **La vista propia del joven** (#22) y **una advertencia si se deja fuera algo observado** (#14). Quedan para la siguiente iteración y están anotados en DECISIONS.
- **El formato de fecha** (#17). Lo pone el navegador del teléfono según su idioma.
