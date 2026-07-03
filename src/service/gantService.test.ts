import { describe, expect, it } from 'vitest'

import { GantService } from './gantService'
import type { Link } from '@/types/links'

const MS_PER_DAY = 86_400_000

describe('GantService.buildGantt', () => {
  it('возвращает пустой массив, если узлов нет', () => {
    const result = GantService.buildGantt([], [], 0)

    expect(result).toEqual([])
  })

  it('рассчитывает одиночную задачу от globalStart', () => {
    const nodes = [{ id: 1, nm: 'Задача 1', duration: 2 }]
    const links: Link[] = []

    const result = GantService.buildGantt(nodes, links, 1_000)

    expect(result).toEqual([
      { id: 1, nm: 'Задача 1', duration: 2, start: 1_000, end: 1_000 + 2 * MS_PER_DAY, level: 0 },
    ])
  })

  it('рассчитывает цепочку finish-to-start', () => {
    const nodes = [
      { id: 1, nm: 'A', duration: 1 },
      { id: 2, nm: 'B', duration: 2 },
      { id: 3, nm: 'C', duration: 1 },
    ]
    const links: Link[] = [
      { idp: 1, idc: 2 },
      { idp: 2, idc: 3 },
    ]

    const result = GantService.buildGantt(nodes, links, 0)

    expect(result).toEqual([
      { id: 1, nm: 'A', duration: 1, start: 0, end: MS_PER_DAY, level: 0 },
      { id: 2, nm: 'B', duration: 2, start: MS_PER_DAY, end: 3 * MS_PER_DAY, level: 0 },
      { id: 3, nm: 'C', duration: 1, start: 3 * MS_PER_DAY, end: 4 * MS_PER_DAY, level: 0 },
    ])
  })

  it('размещает параллельные задачи на разных уровнях', () => {
    const nodes = [
      { id: 1, nm: 'A', duration: 2 },
      { id: 2, nm: 'B', duration: 1 },
    ]
    const links: Link[] = []

    const result = GantService.buildGantt(nodes, links, 0)

    expect(result).toEqual([
      { id: 1, nm: 'A', duration: 2, start: 0, end: 2 * MS_PER_DAY, level: 0 },
      { id: 2, nm: 'B', duration: 1, start: 0, end: MS_PER_DAY, level: 1 },
    ])
  })

  it('рассчитывает ромбовидный DAG: потомок ждёт обоих предшественников', () => {
    const nodes = [
      { id: 1, nm: 'Root', duration: 1 },
      { id: 2, nm: 'Left', duration: 2 },
      { id: 3, nm: 'Right', duration: 1 },
      { id: 4, nm: 'Join', duration: 1 },
    ]
    const links: Link[] = [
      { idp: 1, idc: 2 },
      { idp: 1, idc: 3 },
      { idp: 2, idc: 4 },
      { idp: 3, idc: 4 },
    ]

    const result = GantService.buildGantt(nodes, links, 0)

    expect(result).toEqual([
      { id: 1, nm: 'Root', duration: 1, start: 0, end: MS_PER_DAY, level: 0 },
      { id: 2, nm: 'Left', duration: 2, start: MS_PER_DAY, end: 3 * MS_PER_DAY, level: 0 },
      { id: 3, nm: 'Right', duration: 1, start: MS_PER_DAY, end: 2 * MS_PER_DAY, level: 1 },
      { id: 4, nm: 'Join', duration: 1, start: 3 * MS_PER_DAY, end: 4 * MS_PER_DAY, level: 0 },
    ])
  })

  it('возвращает пустой массив при цикле в графе', () => {
    const nodes = [
      { id: 1, nm: 'A', duration: 1 },
      { id: 2, nm: 'B', duration: 1 },
    ]
    const links: Link[] = [
      { idp: 1, idc: 2 },
      { idp: 2, idc: 1 },
    ]

    const result = GantService.buildGantt(nodes, links, 0)

    expect(result).toEqual([])
  })

  it('автогенерирует nm и duration для неполных узлов', () => {
    const nodes = [{ id: 5, nm: null, duration: null }]
    const links: Link[] = []

    const result = GantService.buildGantt(nodes, links, 100)

    expect(result).toEqual([
      { id: 5, nm: 'Task name 5', duration: 1, start: 100, end: 100 + MS_PER_DAY, level: 0 },
    ])
  })
})