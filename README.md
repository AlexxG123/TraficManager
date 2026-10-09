# TraficManager

## 1. Nombre y frase
> Sos el que maneja los semáforos de una esquina del centro y tenés que evitar que los autos choquen entre sí.

## 2. Qué hace y cómo se usa
Manejá los semáforos de la esquina y mantené el tránsito en movimiento sin choques.
Tocalos en pantalla o usá el teclado: Espacio o ↑/↓ para vertical; A o ←/→ para horizontal.
Sobreviví, sumá puntos cada 30 segundos y reiniciá con R o con el botón cuando haya un choque.

## 3. Enlace para abrirlo
[http://localhost:5173/](http://localhost:5173/)

El enlace funciona mientras el servidor de desarrollo esté activo.

## 4. Ejecutarlo en otra máquina
Necesitás Node.js y npm. Desde la carpeta del proyecto, instalá las dependencias y arrancá Vite:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Abrí `http://localhost:5173/` en esa máquina. Para probar la compilación y la suite de tests:

```bash
npm run build
npm test
```

Para servir la compilación de producción localmente:

```bash
npm run preview -- --host 0.0.0.0
```

## 5. Mi dirección y lo que encontré al probar
Yo definí el objetivo y las reglas a partir de la ficha, y dirigí los ajustes de circulación: más autos simultáneos, mayor velocidad, separación, recorrido completo, zigzag y centrado de los carriles. Al probarlo encontré autos demasiado juntos y que se metían en el cruce con el semáforo en rojo; ajusté la separación y el punto de frenado para que coincida con la línea dibujada.

## 6. Autoría y explicación
Usé GitHub Copilot Chat en Visual Studio Code. El código lo generó un agente de IA bajo mi dirección. Puedo explicar la configuración y las reglas de tránsito, el movimiento y la detección de choques, la interfaz y sus controles, la adaptación a celulares y las pruebas de Vitest.
