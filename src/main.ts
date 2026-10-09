import './estilo.css'
import {
  actualizarJuego,
  cambiarSemaforo,
  contarAutosEnRiesgo,
  crearEstadoInicial,
  reiniciarJuego,
  CONFIG,
  type Auto,
  type Eje,
  type EstadoJuego,
} from './logica.ts'

const aplicacion = document.querySelector<HTMLDivElement>('#app')!
let estado: EstadoJuego = crearEstadoInicial()
let instanteAnterior = performance.now()
let huboInteraccion = false

aplicacion.innerHTML = `
  <main class="juego" aria-label="TraficManager">
    <header class="barra-superior">
      <div class="marca">
        <span class="marca-indicador" aria-hidden="true"></span>
        <div>
          <p class="sobrelinea">CENTRO DE CONTROL</p>
          <h1>TraficManager</h1>
        </div>
      </div>
      <div class="marcadores" aria-label="Puntajes">
        <div class="marcador">
          <span class="marcador-etiqueta">TIEMPO</span>
          <strong id="tiempo">00:00</strong>
        </div>
        <div class="marcador">
          <span class="marcador-etiqueta">RÉCORD</span>
          <strong id="record">0</strong>
        </div>
      </div>
    </header>

    <section class="panel-partida" aria-label="Cruce de calles">
      <div class="encabezado-cruce">
        <div>
          <p class="sobrelinea">CALLAO × CORRIENTES</p>
          <p id="estado-partida" class="estado-partida" aria-live="polite"></p>
        </div>
        <p id="riesgo" class="riesgo" aria-live="polite">
          <span class="riesgo-punto" aria-hidden="true"></span>
          <span id="riesgo-texto">0 autos en riesgo</span>
        </p>
      </div>

      <div id="cruce" class="cruce" aria-label="Intersección con tránsito en movimiento">
        <div class="calle calle-horizontal" aria-hidden="true"></div>
        <div class="calle calle-vertical" aria-hidden="true"></div>
        <div class="linea-detencion linea-arriba" aria-hidden="true"></div>
        <div class="linea-detencion linea-abajo" aria-hidden="true"></div>
        <div class="linea-detencion linea-izquierda" aria-hidden="true"></div>
        <div class="linea-detencion linea-derecha" aria-hidden="true"></div>
        <div id="autos" class="capa-autos" aria-label="Autos"></div>
        <div id="capa-final" class="capa-final" hidden>
          <p class="sobrelinea">TRÁNSITO INTERRUMPIDO</p>
          <h2>Choque</h2>
          <p class="puntaje-final">Puntaje <strong id="puntaje-final">0</strong></p>
          <button id="otra-vez" class="boton-reinicio boton-reinicio-final" type="button">
            Otra vez <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>

      <div class="panel-semaforos" aria-label="Controles de semáforos">
        <button class="control-semaforo" type="button" data-eje="vertical" aria-label="Cambiar semáforo vertical">
          <span class="nombre-semaforo">VERTICAL <span aria-hidden="true">↕</span></span>
          <span class="luz-semaforo" data-luz="vertical" aria-label="Semáforo vertical en rojo">
            <span class="foco foco-rojo"></span>
            <span class="foco foco-amarillo"></span>
            <span class="foco foco-verde"></span>
          </span>
        </button>
        <button class="control-semaforo" type="button" data-eje="horizontal" aria-label="Cambiar semáforo horizontal">
          <span class="nombre-semaforo">HORIZONTAL <span aria-hidden="true">↔</span></span>
          <span class="luz-semaforo" data-luz="horizontal" aria-label="Semáforo horizontal en rojo">
            <span class="foco foco-rojo"></span>
            <span class="foco foco-amarillo"></span>
            <span class="foco foco-verde"></span>
          </span>
        </button>
      </div>
    </section>

    <footer class="barra-inferior">
      <p id="ayuda-inicial" class="ayuda-inicial">Tocá un semáforo para habilitar el tránsito.</p>
      <div class="atajos" aria-label="Atajos de teclado">
        <span><kbd>ESPACIO</kbd> o <kbd>↑ ↓</kbd> vertical</span>
        <span><kbd>A</kbd> o <kbd>← →</kbd> horizontal</span>
      </div>
      <button id="reiniciar" class="boton-reinicio" type="button" aria-label="Reiniciar partida">
        Reiniciar <span aria-hidden="true">↻</span>
      </button>
    </footer>
  </main>
`

const elementoTiempo = document.querySelector<HTMLElement>('#tiempo')!
const elementoRecord = document.querySelector<HTMLElement>('#record')!
const elementoEstado = document.querySelector<HTMLElement>('#estado-partida')!
const elementoRiesgo = document.querySelector<HTMLElement>('#riesgo')!
const textoRiesgo = document.querySelector<HTMLElement>('#riesgo-texto')!
const capaAutos = document.querySelector<HTMLElement>('#autos')!
const capaFinal = document.querySelector<HTMLElement>('#capa-final')!
const puntajeFinal = document.querySelector<HTMLElement>('#puntaje-final')!
const ayudaInicial = document.querySelector<HTMLElement>('#ayuda-inicial')!

function formatearTiempo(milisegundos: number): string {
  const segundos = Math.floor(milisegundos / CONFIG.milisegundosPorSegundo)
  const minutos = Math.floor(segundos / 60)
  return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
}

function dibujarAuto(auto: Auto): string {
  const carril = CONFIG.separacionCarrilesUnidades
  const distancia = CONFIG.distanciaAparicionUnidades
  const desplazamiento = auto.desplazamientoLateralUnidades
  let x = 50
  let y = 50
  let orientacion = 'horizontal'

  switch (auto.direccion) {
    case 'arriba':
      x += ((-carril + desplazamiento) / (2 * distancia)) * 100
      y -= (auto.distanciaCentro / (2 * distancia)) * 100
      orientacion = 'vertical'
      break
    case 'abajo':
      x += ((carril + desplazamiento) / (2 * distancia)) * 100
      y += (auto.distanciaCentro / (2 * distancia)) * 100
      orientacion = 'vertical'
      break
    case 'izquierda':
      x -= (auto.distanciaCentro / (2 * distancia)) * 100
      y += ((carril + desplazamiento) / (2 * distancia)) * 100
      break
    case 'derecha':
      x += (auto.distanciaCentro / (2 * distancia)) * 100
      y += ((-carril + desplazamiento) / (2 * distancia)) * 100
      break
  }

  return `<span class="auto auto-${orientacion}" role="img" aria-label="Auto desde ${auto.direccion}" style="left:${x}%;top:${y}%"></span>`
}

function dibujar(): void {
  elementoTiempo.textContent = formatearTiempo(estado.tiempoSobrevividoMs)
  elementoRecord.textContent = String(estado.record)
  capaAutos.innerHTML = estado.autos.map(dibujarAuto).join('')

  const inicio = !huboInteraccion && estado.resultado === 'jugando'
  const choque = estado.resultado === 'choque'
  elementoEstado.textContent = choque ? 'FIN DE PARTIDA' : inicio ? 'INICIO DE TURNO' : 'CRUCE EN OPERACIÓN'
  ayudaInicial.hidden = !inicio
  elementoRiesgo.classList.toggle('hay-riesgo', contarAutosEnRiesgo(estado) > 0)
  textoRiesgo.textContent = `${contarAutosEnRiesgo(estado)} autos en riesgo`
  capaFinal.hidden = !choque
  puntajeFinal.textContent = String(estado.puntos)
  document.querySelector('.cruce')?.classList.toggle('cruce-en-choque', choque)

  for (const eje of ['vertical', 'horizontal'] as const) {
    const luz = estado.semaforos[eje]
    const elementoLuz = document.querySelector<HTMLElement>(`[data-luz="${eje}"]`)!
    elementoLuz.setAttribute('aria-label', `Semáforo ${eje} en ${luz}`)
    elementoLuz.dataset.estado = luz
    document.querySelector<HTMLButtonElement>(`[data-eje="${eje}"]`)!.disabled = choque
  }
}

function cambiarEje(eje: Eje): void {
  if (cambiarSemaforo(estado, eje)) huboInteraccion = true
  dibujar()
}

function reiniciarPartida(): void {
  reiniciarJuego(estado)
  huboInteraccion = false
  dibujar()
}

for (const control of document.querySelectorAll<HTMLButtonElement>('.control-semaforo')) {
  control.addEventListener('click', () => {
    const eje = control.dataset.eje
    if (eje === 'vertical' || eje === 'horizontal') cambiarEje(eje)
  })
}

document.querySelector<HTMLButtonElement>('#reiniciar')!.addEventListener('click', () => {
  reiniciarPartida()
})

document.querySelector<HTMLButtonElement>('#otra-vez')!.addEventListener('click', () => {
  reiniciarPartida()
})

document.querySelector<HTMLElement>('#cruce')!.addEventListener('pointerup', (evento) => {
  const cruce = evento.currentTarget as HTMLElement
  const limites = cruce.getBoundingClientRect()
  const x = (evento.clientX - limites.left) / limites.width
  const y = (evento.clientY - limites.top) / limites.height
  const eje: Eje = Math.abs(x - 0.5) > Math.abs(y - 0.5) ? 'horizontal' : 'vertical'
  cambiarEje(eje)
})

document.addEventListener('keydown', (evento) => {
  const tecla = evento.key.toLowerCase()
  const eje: Eje | null =
    tecla === ' ' || tecla === 'arrowup' || tecla === 'arrowdown'
      ? 'vertical'
      : tecla === 'a' || tecla === 'arrowleft' || tecla === 'arrowright'
        ? 'horizontal'
        : null

  if (eje !== null) {
    evento.preventDefault()
    cambiarEje(eje)
  } else if (tecla === 'r') {
    reiniciarPartida()
  }
})

function animar(instante: number): void {
  const deltaMs = instante - instanteAnterior
  instanteAnterior = instante
  actualizarJuego(estado, deltaMs)
  dibujar()
  requestAnimationFrame(animar)
}

dibujar()
requestAnimationFrame(animar)