# DECISIONS — PRUEBA VIVA

## Decisiones

1. **No es un marketplace.** En la pelea de Brain Bending salió que conectar encargos pagados con jóvenes ya existe en plataformas de freelance, y que se acerca a una bolsa de trabajo (zona prohibida). PRUEBA VIVA es una capa de prueba que se pega donde el trabajo ya ocurre; el primer lugar es Jóvenes Construyendo el Futuro.
2. **La IA pregunta y señala, nunca califica.** Un estudio de 2025 muestra que los LLM no coinciden con evaluadores humanos ni consigo mismos entre corridas. La IA propone 5 preguntas y marca dónde repreguntar. El motor descarta cualquier campo o texto con calificación, puntaje o veredicto, y la autoprueba lo verifica.
3. **Gemini en la capa gratuita, solo desde el servidor.** La llave vive en `GEMINI_API_KEY` en Vercel. Si falta o el modelo falla, entra una plantilla determinista, **etiquetada como SIMULADO en pantalla**. Se apagó el "pensamiento" de 2.5 Flash para que no trunque el JSON.
4. **Datos estructurados y verificados: CONOCER.** Los criterios vienen de dos Estándares de Competencia publicados en el DOF (EC0305 atención a clientes, EC0254 venta telefónica): dos de los puestos de entrada que la IA desplaza primero. Están resumidos en lenguaje llano, con el código de cada elemento.
5. **Sello HMAC en lugar de base de datos.** La constancia viaja en el fragmento (#) del enlace, que el navegador no manda al servidor al abrir la página. El servidor la firma con `FIRMA_SECRETA` y la verifica después. Prueba origen e integridad, no verdad. Así no hay cuentas ni datos personales en el servidor, y por eso no hace falta auth.
6. **El servidor vuelve a correr todas las reglas antes de sellar.** Lo que diga el navegador no basta.
7. **Solo trabajo real.** Si el origen es "práctica", no se emite constancia. Es la cláusula de sombra del capítulo: algo que parece trabajo sin serlo.
8. **El peso de la firma es declarado y así se dice.** No se verifica RFC ni inscripción a JCF; la constancia lo declara en el texto.
9. **Firma solo quien supervisó:** el nombre tiene que coincidir con el del tutor del encargo (sin importar acentos ni mayúsculas).
10. **Sin teléfono ni correo en ningún campo.** El filtro de secretos de ESCUDO (semana 8) se amplió con teléfonos, correos y llaves de Google.

## Bugs

| Bug | Cómo se encontró | Arreglo |
|---|---|---|
| La pregunta simulada decía "decidiste \"Decidí empezar…\"" | Pase mecánico | Se quita el verbo inicial (`sinVerbo`) y se agregó una aserción |
| 5 alertas de "hueco" llenaban el cupo antes que la alerta de IA sin explicar | Autoprueba | La alerta de IA va primero |
| Horas de madrugada en la bitácora de ejemplo | Persona test (Dany) | Se dejó de forzar la zona horaria |
| El servidor viejo seguía sirviendo un manifiesto anterior (500 en los chunks) | Pase mecánico | Reiniciar el servidor después de cada build |
| El límite de 20 solicitudes por IP saltó durante las pruebas | Pase mecánico | Es lo esperado: el límite protege la cuota gratuita |

## Lo que no se construyó

Cuentas, base de datos, video de la defensa, verificación de RFC o de JCF, emisión como credencial W3C VC 2.0, historial de tutores y contacto del tutor en la constancia.

## Cierre de sesión

- **Hoy:** packet, motor con 57 aserciones, las cuatro pantallas, la verificación, el pase mecánico y el persona test con 9 cambios.
- **Primer paso de mañana:** configurar `GEMINI_API_KEY` y `FIRMA_SECRETA` en Vercel, correr la prueba 6 con Gemini real y anotar la respuesta.
