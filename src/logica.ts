export const CONFIG = {
  duracionAmarilloMs: 400, // milisegundos
  intervaloPuntajeMs: 30_000, // milisegundos por punto
  velocidadInicialUnidadesPorSegundo: 24, // unidades por segundo
  aumentoVelocidadPorPuntoUnidadesPorSegundo: 4, // unidades por segundo por punto
  intervaloInicialAutosMs: 2_400, // milisegundos entre apariciones
  reduccionIntervaloPorPuntoMs: 180, // milisegundos menos por punto
  intervaloMinimoAutosMs: 450, // milisegundos entre apariciones
  distanciaAparicionUnidades: 180, // unidades desde el centro
  distanciaLineaUnidades: 30, // unidades desde el centro
  distanciaSalidaUnidades: 40, // unidades más allá del centro
  separacionAutosUnidades: 4, // unidades entre autos
  largoAutoUnidades: 18, // unidades
  anchoAutoUnidades: 8, // unidades
  separacionCarrilesUnidades: 10, // unidades desde el centro
  distanciaRiesgoUnidades: 70, // unidades desde el centro
  pasoSimulacionMs: 16, // milisegundos
  milisegundosPorSegundo: 1_000, // milisegundos por segundo
  multiplicadorGenerador: 1_664_525, // coeficiente sin unidad
  incrementoGenerador: 1_013_904_223, // incremento sin unidad
  moduloGenerador: 4_294_967_296, // estados posibles sin unidad
  semillaPredeterminada: 12_345, // valor entero sin unidad
  primerIdentificadorAuto: 1, // identificador sin unidad
} as const

export type Eje = 'horizontal' | 'vertical'
export type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha'
export type Luz = 'rojo' | 'amarillo' | 'verde'
export type ResultadoPartida = 'jugando' | 'choque'
export type GeneradorAleatorio = () => number

export interface Auto {
  id: number
  direccion: Direccion
  distanciaCentro: number
  velocidadUnidadesPorSegundo: number
}

export interface TransicionSemaforo {
  ejeActivo: Eje
  ejeDestino: Eje
  tiempoRestanteMs: number
}

export interface EstadoJuego {
  semilla: number
  generarAleatorio: GeneradorAleatorio
  semaforos: Record<Eje, Luz>
  autos: Auto[]
  tiempoSobrevividoMs: number
  puntos: number
  record: number
  resultado: ResultadoPartida
  transicion: TransicionSemaforo | null
  tiempoParaNuevoAutoMs: number
  proximoIdAuto: number
}

const DIRECCIONES: Direccion[] = ['arriba', 'abajo', 'izquierda', 'derecha']

export function crearGeneradorConSemilla(semilla: number): GeneradorAleatorio {
  let estado = (semilla >>> 0) || CONFIG.semillaPredeterminada

  return () => {
    estado = (Math.imul(estado, CONFIG.multiplicadorGenerador) + CONFIG.incrementoGenerador) >>> 0
    return estado / CONFIG.moduloGenerador
  }
}

function obtenerEje(direccion: Direccion): Eje {
  return direccion === 'arriba' || direccion === 'abajo' ? 'vertical' : 'horizontal'
}

function intervaloAparicion(puntos: number): number {
  return Math.max(
    CONFIG.intervaloMinimoAutosMs,
    CONFIG.intervaloInicialAutosMs - puntos * CONFIG.reduccionIntervaloPorPuntoMs,
  )
}

function crearAuto(id: number, direccion: Direccion, puntos: number): Auto {
  return {
    id,
    direccion,
    distanciaCentro: CONFIG.distanciaAparicionUnidades,
    velocidadUnidadesPorSegundo:
      CONFIG.velocidadInicialUnidadesPorSegundo +
      puntos * CONFIG.aumentoVelocidadPorPuntoUnidadesPorSegundo,
  }
}

export function crearEstadoInicial(
  semilla: number = CONFIG.semillaPredeterminada,
  record: number = 0,
): EstadoJuego {
  const semillaNormalizada = (semilla >>> 0) || CONFIG.semillaPredeterminada
  const autos = DIRECCIONES.map((direccion, indice) =>
    crearAuto(CONFIG.primerIdentificadorAuto + indice, direccion, 0),
  )

  return {
    semilla: semillaNormalizada,
    generarAleatorio: crearGeneradorConSemilla(semillaNormalizada),
    semaforos: { horizontal: 'rojo', vertical: 'rojo' },
    autos,
    tiempoSobrevividoMs: 0,
    puntos: 0,
    record: Number.isFinite(record) ? Math.max(0, record) : 0,
    resultado: 'jugando',
    transicion: null,
    tiempoParaNuevoAutoMs: intervaloAparicion(0),
    proximoIdAuto: CONFIG.primerIdentificadorAuto + DIRECCIONES.length,
  }
}

export function cambiarSemaforo(estado: EstadoJuego, ejeDestino: Eje): boolean {
  if (estado.resultado !== 'jugando' || estado.transicion !== null) return false
  if (estado.semaforos[ejeDestino] === 'verde') return false

  const ejeActivo: Eje | null =
    estado.semaforos.horizontal === 'verde'
      ? 'horizontal'
      : estado.semaforos.vertical === 'verde'
        ? 'vertical'
        : null

  if (ejeActivo === null) {
    estado.semaforos[ejeDestino] = 'verde'
    return true
  }

  estado.semaforos[ejeActivo] = 'amarillo'
  estado.transicion = {
    ejeActivo,
    ejeDestino,
    tiempoRestanteMs: CONFIG.duracionAmarilloMs,
  }
  return true
}

function obtenerPosicion(auto: Auto): { x: number; y: number; orientacion: Eje } {
  const carril = CONFIG.separacionCarrilesUnidades

  switch (auto.direccion) {
    case 'arriba':
      return { x: -carril, y: -auto.distanciaCentro, orientacion: 'vertical' }
    case 'abajo':
      return { x: carril, y: auto.distanciaCentro, orientacion: 'vertical' }
    case 'izquierda':
      return { x: -auto.distanciaCentro, y: carril, orientacion: 'horizontal' }
    case 'derecha':
      return { x: auto.distanciaCentro, y: -carril, orientacion: 'horizontal' }
  }
}

function autosSeTocan(autoA: Auto, autoB: Auto): boolean {
  const posicionA = obtenerPosicion(autoA)
  const posicionB = obtenerPosicion(autoB)
  const largoA = posicionA.orientacion === 'horizontal' ? CONFIG.largoAutoUnidades : CONFIG.anchoAutoUnidades
  const anchoA = posicionA.orientacion === 'horizontal' ? CONFIG.anchoAutoUnidades : CONFIG.largoAutoUnidades
  const largoB = posicionB.orientacion === 'horizontal' ? CONFIG.largoAutoUnidades : CONFIG.anchoAutoUnidades
  const anchoB = posicionB.orientacion === 'horizontal' ? CONFIG.anchoAutoUnidades : CONFIG.largoAutoUnidades

  return (
    Math.abs(posicionA.x - posicionB.x) <= (largoA + largoB) / 2 &&
    Math.abs(posicionA.y - posicionB.y) <= (anchoA + anchoB) / 2
  )
}

function avanzarTransicion(estado: EstadoJuego, deltaMs: number): void {
  const transicion = estado.transicion
  if (transicion === null) return

  transicion.tiempoRestanteMs -= deltaMs
  if (transicion.tiempoRestanteMs > 0) return

  estado.semaforos[transicion.ejeActivo] = 'rojo'
  estado.semaforos[transicion.ejeDestino] = 'verde'
  estado.transicion = null
}

function puedeAparecer(estado: EstadoJuego, direccion: Direccion): boolean {
  const autosMismaDireccion = estado.autos.filter((auto) => auto.direccion === direccion)
  const autoMasLejano = autosMismaDireccion.reduce(
    (distancia, auto) => Math.max(distancia, auto.distanciaCentro),
    Number.NEGATIVE_INFINITY,
  )

  return (
    autosMismaDireccion.length === 0 ||
    autoMasLejano >=
      CONFIG.distanciaAparicionUnidades + CONFIG.largoAutoUnidades + CONFIG.separacionAutosUnidades
  )
}

function intentarAparicion(estado: EstadoJuego): void {
  const direccionesDisponibles = DIRECCIONES.filter((direccion) => puedeAparecer(estado, direccion))
  if (direccionesDisponibles.length === 0) return

  const indice = Math.floor(estado.generarAleatorio() * direccionesDisponibles.length)
  const direccion = direccionesDisponibles[indice]
  if (direccion === undefined) return

  estado.autos.push(crearAuto(estado.proximoIdAuto, direccion, estado.puntos))
  estado.proximoIdAuto += 1
  estado.tiempoParaNuevoAutoMs = intervaloAparicion(estado.puntos)
}

function avanzarAutos(estado: EstadoJuego, deltaMs: number): void {
  const autosOrdenados = [...estado.autos].sort((autoA, autoB) => autoA.distanciaCentro - autoB.distanciaCentro)

  for (const auto of autosOrdenados) {
    const eje = obtenerEje(auto.direccion)
    const avanza = estado.semaforos[eje] === 'verde' || auto.distanciaCentro < CONFIG.distanciaLineaUnidades
    if (!avanza) continue

    const recorrido = auto.velocidadUnidadesPorSegundo * (deltaMs / CONFIG.milisegundosPorSegundo)
    let nuevaDistancia = auto.distanciaCentro - recorrido

    const autoDelante = estado.autos
      .filter(
        (otro) => otro.direccion === auto.direccion && otro.id !== auto.id && otro.distanciaCentro < auto.distanciaCentro,
      )
      .reduce(
        (masCercano, otro) => Math.max(masCercano, otro.distanciaCentro),
        Number.NEGATIVE_INFINITY,
      )

    if (autoDelante !== Number.NEGATIVE_INFINITY) {
      nuevaDistancia = Math.max(
        nuevaDistancia,
        autoDelante + CONFIG.largoAutoUnidades + CONFIG.separacionAutosUnidades,
      )
    }

    if (estado.semaforos[eje] !== 'verde' && auto.distanciaCentro > CONFIG.distanciaLineaUnidades) {
      nuevaDistancia = Math.max(nuevaDistancia, CONFIG.distanciaLineaUnidades)
    }

    auto.distanciaCentro = nuevaDistancia
  }

  estado.autos = estado.autos.filter((auto) => auto.distanciaCentro >= -CONFIG.distanciaSalidaUnidades)
}

function hayChoque(autos: Auto[]): boolean {
  for (let indiceA = 0; indiceA < autos.length; indiceA += 1) {
    const autoA = autos[indiceA]
    if (autoA === undefined) continue

    for (let indiceB = indiceA + 1; indiceB < autos.length; indiceB += 1) {
      const autoB = autos[indiceB]
      if (autoB !== undefined && autosSeTocan(autoA, autoB)) return true
    }
  }

  return false
}

function avanzarSubpaso(estado: EstadoJuego, deltaMs: number): void {
  avanzarTransicion(estado, deltaMs)
  estado.tiempoSobrevividoMs += deltaMs
  estado.puntos = Math.floor(estado.tiempoSobrevividoMs / CONFIG.intervaloPuntajeMs)
  estado.record = Math.max(estado.record, estado.puntos)

  estado.tiempoParaNuevoAutoMs -= deltaMs
  if (estado.tiempoParaNuevoAutoMs <= 0) intentarAparicion(estado)

  avanzarAutos(estado, deltaMs)
  if (hayChoque(estado.autos)) estado.resultado = 'choque'
}

export function actualizarJuego(estado: EstadoJuego, deltaMs: number): boolean {
  if (estado.resultado !== 'jugando' || !Number.isFinite(deltaMs) || deltaMs <= 0) return false

  let tiempoRestanteMs = deltaMs
  while (tiempoRestanteMs > 0 && estado.resultado === 'jugando') {
    const subpasoMs = Math.min(tiempoRestanteMs, CONFIG.pasoSimulacionMs)
    avanzarSubpaso(estado, subpasoMs)
    tiempoRestanteMs -= subpasoMs
  }

  return true
}

export function contarAutosEnRiesgo(estado: EstadoJuego): number {
  const autosCercanos = estado.autos.filter(
    (auto) => Math.abs(auto.distanciaCentro) <= CONFIG.distanciaRiesgoUnidades,
  )
  const idsEnRiesgo = new Set<number>()

  for (let indiceA = 0; indiceA < autosCercanos.length; indiceA += 1) {
    const autoA = autosCercanos[indiceA]
    if (autoA === undefined) continue

    for (let indiceB = indiceA + 1; indiceB < autosCercanos.length; indiceB += 1) {
      const autoB = autosCercanos[indiceB]
      if (autoB !== undefined && obtenerEje(autoA.direccion) !== obtenerEje(autoB.direccion)) {
        idsEnRiesgo.add(autoA.id)
        idsEnRiesgo.add(autoB.id)
      }
    }
  }

  return idsEnRiesgo.size
}

export function reiniciarJuego(estado: EstadoJuego): boolean {
  const nuevoEstado = crearEstadoInicial(estado.semilla, estado.record)
  Object.assign(estado, nuevoEstado)
  return true
}