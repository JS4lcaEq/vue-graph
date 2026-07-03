/**
 * Учебный пример: toMatchObject + oracle + полуинтеграционный тест.
 *
 * LocalStoreService уже покрыт localStoreService.test.ts — здесь не дублируем
 * его проверки, но используем настоящий localStorage (без vi.mock).
 * Это «тонкий» интеграционный тест: store + реальный LocalStoreService.
 *
 * Oracle — независимый источник ожидаемого результата:
 *   ✓ константа:             { id: 2 }
 *   ✓ своё простое правило:   let nextExpectedId = 1; nextExpectedId++
 *   ✗ методы тестируемого объекта:  store.findMaxId() + 1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNodesStore } from './nodes'

const STORAGE_KEY = 'nodes-data'

describe('useNodesStore — автогенерация id', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('автогенерирует id=2 для второго узла, если первый добавлен с id=1', () => {
    const store = useNodesStore()

    // 1. пустой store (localStorage очищен в beforeEach)
    expect(store.All()).toEqual([])

    // 2. добавить элемент с явным id=1
    store.Add({ id: 1, nm: 'Первый' })

    // 3. добавить элемент без id
    store.Add({ id: null, nm: 'Второй' })

    // 4. oracle вручную: 1 + 1 = 2 (не store.findMaxId() + 1)
    expect(store.All()[1]).toMatchObject({ id: 2 })

    // полуинтеграция: store сохранил данные через реальный LocalStoreService
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(2)
  })

  it('автогенерирует id=1, 2, 3 при трёх добавлениях без id', () => {
    const store = useNodesStore()

    let nextExpectedId = 1

    for (let i = 0; i < 3; i++) {
      store.Add({ id: null, nm: `Узел ${i + 1}` })

      expect(store.All()[i]).toMatchObject({ id: nextExpectedId })
      nextExpectedId++
    }
  })
})

describe('useNodesStore — индекс getIndex', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('getIndex содержит узел после Add', () => {
    const store = useNodesStore()

    store.Add({ id: 1, nm: 'Первый' })
    store.Add({ id: 2, nm: 'Второй' })

    expect(store.getIndex()[1]).toMatchObject({ id: 1, nm: 'Первый' })
    expect(store.getIndex()[2]).toMatchObject({ id: 2, nm: 'Второй' })
    expect(Object.keys(store.getIndex())).toHaveLength(2)
  })

  it('getIndex не содержит узел после Delete', () => {
    const store = useNodesStore()

    store.Add({ id: 1, nm: 'Первый' })
    store.Add({ id: 2, nm: 'Второй' })
    store.Delete(1)

    expect(store.getIndex()[1]).toBeUndefined()
    expect(store.getIndex()[2]).toMatchObject({ id: 2, nm: 'Второй' })
  })

  it('getIndex пуст после Clear', () => {
    const store = useNodesStore()

    store.Add({ id: 1, nm: 'Первый' })
    store.Clear()

    expect(store.getIndex()).toEqual({})
  })
})