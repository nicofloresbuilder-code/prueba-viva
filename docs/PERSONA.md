# PERSONA TEST — PRUEBA VIVA

**Semana 9 · Nicolás Flores**

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
