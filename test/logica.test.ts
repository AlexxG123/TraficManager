import { describe, expect, it } from 'vitest'
import {
  actualizarJuego,
  cambiarSemaforo,
  contarAutosEnRiesgo,
  crearEstadoInicial,
  reiniciarJuego,
  CONFIG,
} from '../src/logica'

describe('Reglas del minijuego TraficManager', () => {
  it('arma el estado inicial con los cuatro autos y ambos semáforos en rojo', () => {
    const estado = crearEstadoInicial(7, 3)

    expect(estado.semilla).toBe(7)
    expect(estado.autos.map((auto) => auto.direccion)).toEqual([
      'arriba',
      'abajo',
      'izquierda',
      'derecha',
    ])
    expect(estado.semaforos).toEqual({ horizontal: 'rojo', vertical: 'rojo' })
    expect(estado.tiempoSobrevividoMs).toBe(0)
    expect(estado.puntos).toBe(0)
    expect(estado.record).toBe(3)
    expect(estado.resultado).toBe('jugando')
  })

  it('cambia válidamente el semáforo y rechaza repetir el eje que ya está verde', () => {
    const estado = crearEstadoInicial()

    expect(cambiarSemaforo(estado, 'vertical')).toBe(true)
    expect(estado.semaforos.vertical).toBe('verde')
    expect(cambiarSemaforo(estado, 'vertical')).toBe(false)
    expect(estado.semaforos.vertical).toBe('verde')
  })

  it('pone amarillo durante 400 milisegundos antes de habilitar el otro eje', () => {
    const estado = crearEstadoInicial()
    cambiarSemaforo(estado, 'vertical')

    expect(cambiarSemaforo(estado, 'horizontal')).toBe(true)
    expect(estado.semaforos).toEqual({ horizontal: 'rojo', vertical: 'amarillo' })
    expect(estado.transicion?.tiempoRestanteMs).toBe(CONFIG.duracionAmarilloMs)
    expect(cambiarSemaforo(estado, 'vertical')).toBe(false)

    expect(actualizarJuego(estado, CONFIG.duracionAmarilloMs)).toBe(true)
    expect(estado.semaforos).toEqual({ horizontal: 'verde', vertical: 'rojo' })
    expect(estado.transicion).toBeNull()
  })

  it('rechaza avanzar con un tiempo inválido o después de un choque', () => {
    const estado = crearEstadoInicial()

    expect(actualizarJuego(estado, 0)).toBe(false)
    expect(actualizarJuego(estado, -1)).toBe(false)
    expect(estado.tiempoSobrevividoMs).toBe(0)

    estado.resultado = 'choque'
    expect(actualizarJuego(estado, 16)).toBe(false)
    expect(estado.tiempoSobrevividoMs).toBe(0)
  })

  it('cuenta los autos de ejes distintos que se acercan al cruce', () => {
    const estado = crearEstadoInicial()
    estado.autos = [
      {
        id: 10,
        direccion: 'arriba',
        distanciaCentro: 60,
        desplazamientoLateralUnidades: 0,
        velocidadUnidadesPorSegundo: 24,
      },
      {
        id: 11,
        direccion: 'izquierda',
        distanciaCentro: 65,
        desplazamientoLateralUnidades: 0,
        velocidadUnidadesPorSegundo: 24,
      },
    ]

    expect(contarAutosEnRiesgo(estado)).toBe(2)
    estado.autos[1]!.distanciaCentro = CONFIG.distanciaRiesgoUnidades + 1
    expect(contarAutosEnRiesgo(estado)).toBe(0)
  })

  it('mantiene cada auto hasta que completa la calle y sale del cuadro', () => {
    const estado = crearEstadoInicial(31)
    estado.autos = [
      {
        id: 1,
        direccion: 'arriba',
        distanciaCentro: CONFIG.distanciaAparicionUnidades,
        desplazamientoLateralUnidades: 0,
        velocidadUnidadesPorSegundo: CONFIG.velocidadInicialUnidadesPorSegundo,
      },
    ]
    estado.tiempoParaNuevoAutoMs = 20_000
    cambiarSemaforo(estado, 'vertical')

    expect(actualizarJuego(estado, 12_000)).toBe(true)
    expect(estado.autos).toHaveLength(1)
    expect(estado.autos[0]?.distanciaCentro).toBeLessThan(0)

    expect(actualizarJuego(estado, 6_000)).toBe(true)
    expect(estado.autos).toHaveLength(0)
  })

  it('detiene los autos en rojo antes de invadir la intersección', () => {
    const estado = crearEstadoInicial(19)
    const auto = {
      id: 20,
      direccion: 'izquierda' as const,
      distanciaCentro: 100,
      desplazamientoLateralUnidades: 0,
      velocidadUnidadesPorSegundo: CONFIG.velocidadInicialUnidadesPorSegundo,
    }
    estado.autos = [auto]
    estado.tiempoParaNuevoAutoMs = 10_000

    expect(actualizarJuego(estado, 2_000)).toBe(true)
    expect(auto.distanciaCentro).toBeCloseTo(CONFIG.distanciaLineaUnidades, 8)
    expect(estado.semaforos.horizontal).toBe('rojo')
  })

  it('hace aparecer autos simultáneamente en todas las direcciones con espacio', () => {
    const estado = crearEstadoInicial(17)
    estado.autos = []
    estado.tiempoParaNuevoAutoMs = CONFIG.pasoSimulacionMs

    expect(actualizarJuego(estado, CONFIG.pasoSimulacionMs)).toBe(true)
    expect(estado.autos).toHaveLength(4)
    expect(new Set(estado.autos.map((auto) => auto.direccion)).size).toBe(4)
    expect(estado.autos.every((auto) => auto.distanciaCentro < CONFIG.distanciaAparicionUnidades)).toBe(true)
  })

  it('forma filas de varios autos en cada calle sin que se adelanten', () => {
    const estado = crearEstadoInicial(17)
    estado.autos = []
    estado.tiempoParaNuevoAutoMs = CONFIG.pasoSimulacionMs
    actualizarJuego(estado, CONFIG.pasoSimulacionMs)

    cambiarSemaforo(estado, 'vertical')
    actualizarJuego(estado, 1_200)
    estado.tiempoParaNuevoAutoMs = CONFIG.pasoSimulacionMs
    actualizarJuego(estado, CONFIG.pasoSimulacionMs)

    expect(estado.autos.filter((auto) => auto.direccion === 'arriba')).toHaveLength(2)
    expect(estado.autos.filter((auto) => auto.direccion === 'abajo')).toHaveLength(2)

    cambiarSemaforo(estado, 'horizontal')
    actualizarJuego(estado, CONFIG.duracionAmarilloMs)
    actualizarJuego(estado, 1_200)
    estado.tiempoParaNuevoAutoMs = CONFIG.pasoSimulacionMs
    actualizarJuego(estado, CONFIG.pasoSimulacionMs)

    for (const direccion of ['arriba', 'abajo', 'izquierda', 'derecha']) {
      expect(estado.autos.filter((auto) => auto.direccion === direccion).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('alterna la posición lateral de los autos consecutivos en cada calle', () => {
    const estado = crearEstadoInicial(29)
    estado.autos = []
    estado.tiempoParaNuevoAutoMs = CONFIG.pasoSimulacionMs
    actualizarJuego(estado, CONFIG.pasoSimulacionMs)

    for (const auto of estado.autos) auto.distanciaCentro = CONFIG.distanciaAparicionUnidades - 40
    estado.tiempoParaNuevoAutoMs = CONFIG.pasoSimulacionMs
    actualizarJuego(estado, CONFIG.pasoSimulacionMs)

    for (const direccion of ['arriba', 'abajo', 'izquierda', 'derecha']) {
      const autosDeLaCalle = estado.autos
        .filter((auto) => auto.direccion === direccion)
        .sort((autoA, autoB) => autoA.id - autoB.id)

      expect(autosDeLaCalle).toHaveLength(2)
      expect(autosDeLaCalle[0]?.desplazamientoLateralUnidades).toBe(
        CONFIG.desplazamientoZigzagUnidades,
      )
      expect(autosDeLaCalle[1]?.desplazamientoLateralUnidades).toBe(
        -CONFIG.desplazamientoZigzagUnidades,
      )
    }
  })

  it('mantiene el espacio mínimo cuando un auto rápido alcanza a otro', () => {
    const estado = crearEstadoInicial(17)
    const autoDeAdelante = {
      id: 10,
      direccion: 'arriba' as const,
      distanciaCentro: 80,
      desplazamientoLateralUnidades: 0,
      velocidadUnidadesPorSegundo: 8,
    }
    const autoDeAtras = {
      id: 11,
      direccion: 'arriba' as const,
      distanciaCentro: 110,
      desplazamientoLateralUnidades: 0,
      velocidadUnidadesPorSegundo: 60,
    }
    estado.autos = [autoDeAdelante, autoDeAtras]
    estado.semaforos.vertical = 'verde'
    estado.tiempoParaNuevoAutoMs = 10_000

    expect(actualizarJuego(estado, 3_000)).toBe(true)
    expect(autoDeAtras.distanciaCentro).toBeGreaterThan(autoDeAdelante.distanciaCentro)
    expect(autoDeAtras.distanciaCentro - autoDeAdelante.distanciaCentro).toBeGreaterThanOrEqual(
      CONFIG.largoAutoUnidades + CONFIG.separacionAutosUnidades - 0.001,
    )
  })

  it('termina mal cuando dos autos se tocan y bloquea nuevas acciones', () => {
    const estado = crearEstadoInicial()
    estado.autos = [
      {
        id: 10,
        direccion: 'arriba',
        distanciaCentro: 0,
        desplazamientoLateralUnidades: 0,
        velocidadUnidadesPorSegundo: 24,
      },
      {
        id: 11,
        direccion: 'izquierda',
        distanciaCentro: 0,
        desplazamientoLateralUnidades: 0,
        velocidadUnidadesPorSegundo: 24,
      },
    ]

    expect(actualizarJuego(estado, 16)).toBe(true)
    expect(estado.resultado).toBe('choque')
    expect(actualizarJuego(estado, 16)).toBe(false)
    expect(cambiarSemaforo(estado, 'vertical')).toBe(false)
  })

  it('reinicia una partida y conserva el récord incluso después del choque', () => {
    const estado = crearEstadoInicial(23, 4)
    cambiarSemaforo(estado, 'vertical')
    estado.resultado = 'choque'

    expect(reiniciarJuego(estado)).toBe(true)
    expect(estado.resultado).toBe('jugando')
    expect(estado.semaforos).toEqual({ horizontal: 'rojo', vertical: 'rojo' })
    expect(estado.tiempoSobrevividoMs).toBe(0)
    expect(estado.puntos).toBe(0)
    expect(estado.record).toBe(4)
    expect(estado.semilla).toBe(23)
  })

  it('permite completar una partida de más de 30 segundos y alcanzar el buen final', () => {
    const estado = crearEstadoInicial(42)

    expect(cambiarSemaforo(estado, 'vertical')).toBe(true)
    expect(actualizarJuego(estado, 35_000)).toBe(true)

    expect(estado.resultado).toBe('jugando')
    expect(estado.puntos).toBe(1)
    expect(estado.record).toBe(1)
    expect(estado.tiempoSobrevividoMs).toBeGreaterThanOrEqual(CONFIG.intervaloPuntajeMs)
  })
})