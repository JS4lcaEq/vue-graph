import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLinksStore } from './links'

const STORAGE_KEY = 'links-data'

describe('useLinksStore — GetList', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('возвращает пустой список при инициализации', () => {
    const store = useLinksStore()

    expect(store.GetList()).toEqual([])
  })
})

describe('useLinksStore — Add', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('добавляет связь и возвращает её', () => {
    const store = useLinksStore()
    const link = { idp: 1, idc: 2 }

    const result = store.Add(link)

    expect(result).toEqual(link)
    expect(store.GetList()).toEqual([{ idp: 1, idc: 2 }])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([{ idp: 1, idc: 2 }])
  })

  it('добавляет несколько связей', () => {
    const store = useLinksStore()

    store.Add({ idp: 1, idc: 2 })
    store.Add({ idp: 2, idc: 3 })

    expect(store.GetList()).toEqual([
      { idp: 1, idc: 2 },
      { idp: 2, idc: 3 },
    ])
  })
})

describe('useLinksStore — Delete', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('удаляет связь по паре idp и idc', () => {
    const store = useLinksStore()

    store.Add({ idp: 1, idc: 2 })
    store.Add({ idp: 2, idc: 3 })
    store.Delete({ idp: 1, idc: 2 })

    expect(store.GetList()).toEqual([{ idp: 2, idc: 3 }])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([{ idp: 2, idc: 3 }])
  })

  it('не изменяет список при удалении несуществующей связи', () => {
    const store = useLinksStore()

    store.Add({ idp: 1, idc: 2 })
    store.Delete({ idp: 9, idc: 10 })

    expect(store.GetList()).toEqual([{ idp: 1, idc: 2 }])
  })
})