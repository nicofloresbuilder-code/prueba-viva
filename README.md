# PRUEBA VIVA

Una prueba que la IA no puede hacer por ti. El joven hace un trabajo real, registra en una bitácora cómo lo hizo y lo defiende en vivo frente a quien lo supervisó. Esa persona firma, criterio por criterio, y el joven recibe una constancia que cualquier empresa puede verificar desde un enlace de WhatsApp.

Proyecto de la semana 9 de AI 2041 (capítulo 8, "The Job Savior"). Ataca el vacío de **primera prueba**.

## Por qué

La IA se está comiendo los empleos de entrada que antes daban la primera prueba de capacidad. Además, ya hace en minutos lo que quedaba para demostrar capacidad sin empleo: el portafolio, la tarea para llevar a casa, el examen en línea. Lo que no puede hacer es explicar en vivo por qué tú decidiste lo que decidiste.

## Cómo funciona

1. **Encargo** (tutor): un trabajo real que alguien necesitaba, ligado a criterios oficiales de CONOCER (EC0305, EC0254).
2. **Bitácora** (joven): qué hizo, qué decidió y por qué, y si usó IA y para qué.
3. **Defensa** (juntos): Gemini lee la bitácora y propone 5 preguntas. El tutor marca cómo respondió cada una. Si se le pide, la IA señala dónde repreguntar. **La IA nunca califica.**
4. **Firma** (tutor): criterio por criterio, "lo vi" o "no lo vi". El servidor sella la constancia con HMAC.
5. **Verificación**: `/verificar#…` comprueba que la constancia salió de aquí y que nadie la editó.

## Correrlo

```bash
npm install
cp .env.example .env.local   # y pon tus valores
npm run dev                   # http://localhost:3000
npx tsx src/lib/__selftest.ts # 57 aserciones del motor
```

Variables de entorno (en Vercel: Settings → Environment Variables):

| Variable | Para qué | ¿Obligatoria? |
|---|---|---|
| `GEMINI_API_KEY` | Llave gratuita de Google AI Studio | No: sin ella, las preguntas salen de una plantilla etiquetada SIMULADO |
| `FIRMA_SECRETA` | Texto aleatorio de 32 caracteres o más para sellar constancias | Sí, para emitir y verificar |
| `GEMINI_MODEL` | Modelo a usar (por defecto `gemini-2.5-flash`) | No |

## Estructura

| Archivo | Qué contiene |
|---|---|
| `src/lib/motor.ts` | Todas las reglas: validaciones, filtro de secretos, "la IA no califica", firma y constancia |
| `src/lib/estandares.ts` | Criterios de EC0305 y EC0254 (CONOCER, DOF) |
| `src/lib/ia.ts` | Prompts para Gemini y el respaldo simulado |
| `src/lib/sello.ts` | Sello HMAC-SHA256 y formato del enlace |
| `src/app/api/*` | Preguntas, alertas, sellar, verificar y estado |
| `src/components/PruebaViva.tsx` | Las cuatro pantallas |
| `docs/PACKET.md` | El paquete antes del código, con diagramas |
| `docs/PERSONA.md` | El persona test y los cambios que produjo |
| `DECISIONS.md` | Decisiones, bugs y lo que no se construyó |

## Datos y seguridad

No hay cuentas, base de datos ni datos personales en el servidor: todo vive en el navegador de quien lo usa. Las llaves solo existen en variables de entorno de Vercel, nunca en el repo. Cada campo tiene límites de largo y rechaza contraseñas, CURP, RFC de persona, tarjetas, teléfonos y correos antes de guardarlos. El servidor vuelve a validar todo antes de llamar al modelo o de sellar. La ferretería, el tutor y el joven del ejemplo son inventados y están etiquetados en pantalla.

PRUEBA VIVA usa criterios de CONOCER, pero **no emite certificaciones oficiales**.

## Stack

Next.js 16 (App Router), React 19, TypeScript y Gemini (capa gratuita). Sin dependencias de interfaz.
