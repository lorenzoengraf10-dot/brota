import { describe, it, expect } from 'vitest'
import { parseMoney, parseCount, slugify, toLocalISO } from './format'

describe('parseMoney', () => {
  it('parsea montos válidos', () => {
    expect(parseMoney('1500')).toBe(1500)
    expect(parseMoney('99.5')).toBe(99.5)
  })
  it('clampa negativos a 0', () => {
    expect(parseMoney('-50')).toBe(0)
  })
  it('devuelve 0 para vacío o basura', () => {
    expect(parseMoney('')).toBe(0)
    expect(parseMoney('abc')).toBe(0)
  })
})

describe('parseCount', () => {
  it('parsea enteros válidos', () => {
    expect(parseCount('7')).toBe(7)
  })
  it('trunca decimales', () => {
    expect(parseCount('7.9')).toBe(7)
  })
  it('clampa negativos a 0', () => {
    expect(parseCount('-3')).toBe(0)
  })
  it('devuelve 0 para vacío o basura', () => {
    expect(parseCount('')).toBe(0)
    expect(parseCount('x')).toBe(0)
  })
})

describe('slugify', () => {
  it('normaliza acentos y espacios', () => {
    expect(slugify('Tortas de Sofí')).toBe('tortas-de-sofi')
  })
  it('remueve guiones de los bordes', () => {
    expect(slugify('  ¡Hola!  ')).toBe('hola')
  })
})

describe('toLocalISO', () => {
  it('formatea con padding', () => {
    expect(toLocalISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
