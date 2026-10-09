# Prompts de usuario: TraficManager

Este archivo reúne tus solicitudes de esta conversación, en orden. No incluye las respuestas del asistente.

## 1. Crear la lógica del juego

Creá el archivo src/logica.ts con las reglas de [MI JUEGO / MI APLICACIÓN], según la ficha de abajo.

REGLAS TÉCNICAS, obligatorias
- TypeScript. Exportá los tipos y el objeto CONFIG con todos los números juntos arriba, cada uno con un comentario que diga su unidad.
- Este archivo NO puede tocar la pantalla: nada de document, window, alert ni console.log. Solo datos y funciones sobre el estado.
- Cada función que cambia el estado devuelve true si la acción fue válida y false si no se pudo hacer.
- Si hace falta azar, usá un generador con semilla y exportalo, para que la misma semilla dé siempre el mismo resultado.
- Código y comentarios en español.

REGLAS DE TRABAJO
- Hacé exactamente lo que dice la ficha. Nada más.
- Si algo es ambiguo o imposible, paralo y preguntame antes de inventar.
- Al terminar, listame qué dejaste fuera y qué decidiste vos donde la ficha no decía nada.

FICHA:
Minijuego: TraficManager

## EN UNA FRASE
Sos el que maneja los semáforos de una esquina del centro y tenés que evitar que los autos choquen entre sí.

## PARA QUIÉN ES
Para Martina, 34, que vuelve del trabajo en colectivo mirando por la ventana cómo nadie respeta el semáforo de Callao y Corrientes y piensa "yo lo haría mejor". Necesita descargarse 30 segundos en el bondi.

## QUÉ LOGRA
Mantener el tráfico fluyendo y sin choques durante el mayor tiempo posible. El jugador siente que por una vez alguien le hace caso a los autos.

## LOS TRES VERBOS
1. Tocar (cambiar el semáforo de un sentido)
2. Mirar (leer el tráfico que viene)
3. Esperar (dejar pasar sin apurar)

## TERMINA BIEN SI…
Sobrevivís a oleadas cada vez más densas de autos. Cada 30 segundos sin choque suma un punto y sube la dificultad. La partida no "gana" del todo: aguantás hasta donde puedas y tu récord queda guardado.

## TERMINA MAL SI…
Dos autos se cruzan en el mismo carril al mismo tiempo. Pantalla roja, choque sonoro, se frena todo, aparece el puntaje final y un botón grande de "otra vez".

## QUÉ SE VE EN PANTALLA
- El cruce completo con sus cuatro bocas (arriba, abajo, izquierda, derecha).
- Los dos semáforos siempre visibles: horizontal y vertical, con su luz actual.
- Los autos en movimiento acercándose a la intersección.
- El contador de tiempo sobrevivido y el récord, arriba.
- Un indicador chico de "autos en riesgo" cuando dos están por cruzarse.

## CONTROLES
**Con el teclado:**
- `Espacio` o `↑/↓`: cambia el semáforo vertical.
- `A` o `←/→`: cambia el semáforo horizontal.
- `R`: reinicia.

**Con el dedo:**
- Tocar la mitad superior/inferior de la pantalla: cambia el semáforo vertical.
- Tocar la mitad izquierda/derecha: cambia el semáforo horizontal.
- Botón de reinicio abajo a la derecha.

## COLORES Y QUÉ SIGNIFICAN
- **Verde:** el carril está liberado, los autos de ese sentido avanzan.
- **Rojo:** el carril está detenido, los autos frenan antes de la línea.
- **Amarillo:** transición, un latido antes del cambio. Dura 400 ms.
- **Gris oscuro:** el asfalto, el fondo, todo lo que no pide atención.

## CRITERIO DE ACEPTACIÓN
Abro el juego, veo el cruce con autos grises viniendo desde las cuatro puntas. Toco la parte de arriba para poner el semáforo vertical en verde y los autos de arriba y abajo arrancan. Cuando uno de la izquierda se acerca, toco la parte izquierda rápido, se pone amarillo, después verde, y cruza justo. Sobrevivo 45 segundos hasta que dos se me cruzan y explota todo en rojo. Veo mi puntaje, toco "otra vez" y arranca de cero.

## LO QUE NO VA
- Sin peatones, sin bocinas, sin clima.
- Sin autos que doblen: todos van derecho.
- Sin niveles con nombre ni historia.
- Sin sonido más allá del golpe final.
- Sin menú de inicio: se abre y ya estás jugando.

## 2. Pregunta sobre cómo verlo

como veo el juego?

## 3. Pruebas con Vitest

Escribí pruebas con Vitest para src/logica.ts, en test/logica.test.ts.

Como mínimo cinco, y tienen que cubrir:
1. Que el estado inicial se arme bien.
2. Cada acción del usuario: qué hace cuando es válida y qué devuelve cuando no.
3. Que no se pueda hacer una acción prohibida por las reglas.
4. La condición de «termina bien» y la de «termina mal» de mi ficha.
5. UNA PRUEBA QUE RECORRA UN USO COMPLETO de principio a fin y compruebe que SE PUEDE LLEGAR AL FINAL BUENO.

Los nombres de las pruebas en español y en forma de frase.
No modifiques src/logica.ts. Al terminar corré npm test y pegame el resultado.

## 4. Crear la pantalla

Creá src/main.ts y src/estilo.css para mostrar TraficManager en pantalla.

REGLAS
- main.ts NO decide nada: llama a las funciones de logica.ts y dibuja el resultado. Si tenés que escribir una regla acá, está en el lugar equivocado: decímelo en lugar de hacerlo.
- Tres estados visibles: el inicio, el uso normal y el final.
- Contraste alto y texto nunca menor a 16 píxeles.
- Los colores según mi ficha. Sin imágenes ni librerías externas.
- Importá el CSS desde main.ts con: import './estilo.css'

Ajustá index.html para que tenga un div con id="app" y cargue src/main.ts como módulo. Al terminar confirmame que no hay errores en la consola.

## 5. Completar el recorrido y generar más autos

esta bien pero hay cosas q quiero q mejores: q los autos hagan su recorrido completo xq en el jueguito cuando llegan al borde del cuadro de en medio desaparecen, lo q quiero esq hagan el recorrido de la calle completo, y tambien haz q aparezcan mas autos y q sea simultaneamente

## 6. Agregar más autos por calle y aumentar velocidad

ya pero los autos en vertical se sobre pasan y eso no tiene mucha logica ya q ahi habria un choque, se paralos mas y ya te dije agrega mas coches x cada calle, es decir q salga mas de 2 o 3 coches en vertical y horizontal, y aumenta un poco la velocidad

## 7. Separar y hacer zigzag

esta bien me gusta pero siguen estando muy pegados como ves en la imagen, las dos calles en vertical como en horizontal pasan muy cerca y eso en teoria dejaria un choque, por eso centra mas los autos en la calle

[Adjuntaste una captura de pantalla del juego como referencia.]

## 8. Ajustes para celulares

Hacé que esto funcione bien en un celular:

1. Todo lo que se toca tiene que medir al menos 44 píxeles de alto y de ancho.
2. Nada se sale de la pantalla a lo ancho: cero desplazamiento horizontal.
3. El texto nunca baja de 16 píxeles.
4. Funciona con el dedo (toque) y también con teclado, las dos cosas.
5. Agregá la etiqueta viewport en index.html si falta.

No cambies las reglas ni la dificultad. Decime qué ajustaste.

## 9. Auditoría del proyecto

Revisá todo el proyecto buscando estos seis problemas, y decime cuáles tiene y en qué línea está cada uno:

1. Lógica metida dentro de main.ts.
2. Números sueltos fuera del objeto CONFIG.
3. Un final bueno al que no se pueda llegar: hacé el cálculo con los números reales.
4. Estado que no se reinicia bien al empezar de nuevo.
5. Variables o funciones que quedaron sin uso.
6. Alguna regla de mi ficha que las pruebas no cubran.

Solo el informe, numerado. TODAVÍA NO ARREGLES NADA.

## 10. README

Escribí el archivo README.md en español con estas seis partes:

1. Nombre y la frase de mi ficha.
2. Qué hace y cómo se usa, en tres líneas.
3. El enlace para abrirlo.
4. Cómo correrlo en otra máquina: los comandos exactos.
5. Qué dirigí yo y qué error encontré probando.
6. Declaración de autoría: qué herramienta usé, que el código lo generó un agente de IA bajo mi dirección, y qué partes puedo explicar.

## 11. Reunir los prompts

haz un archivo .md llamado prompt.md donde esten todos los prompts q te he dado
