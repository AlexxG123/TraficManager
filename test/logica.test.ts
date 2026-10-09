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
      { id: 10, direccion: 'arriba', distanciaCentro: 60, velocidadUnidadesPorSegundo: 24 },
      { id: 11, direccion: 'izquierda', distanciaCentro: 65, velocidadUnidadesPorSegundo: 24 },
    ]

    expect(contarAutosEnRiesgo(estado)).toBe(2)
    estado.autos[1]!.distanciaCentro = CONFIG.distanciaRiesgoUnidades + 1
    expect(contarAutosEnRiesgo(estado)).toBe(0)
  })

  it('termina mal cuando dos autos se tocan y bloquea nuevas acciones', () => {
    const estado = crearEstadoInicial()
    estado.autos = [
      { id: 10, direccion: 'arriba', distanciaCentro: 0, velocidadUnidadesPorSegundo: 24 },
      { id: 11, direccion: 'izquierda', distanciaCentro: 0, velocidadUnidadesPorSegundo: 24 },
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