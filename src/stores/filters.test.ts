import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFiltersStore } from './filters'

const STORAGE_KEY = 'filters-data'

const sampleFilter = {
  id: 1,
  fRoleInCase: 'Заёмщик',
  fCommitmentRole: 'Поручитель',
  fMemberStatus: 'Активный',
  fNoneResident: 'Нет',
  fSegmentType: 'МСБ',
  fKIB: 'Да',
}

const emptyFields = {
  fRoleInCase: '',
  fCommitmentRole: '',
  fMemberStatus: '',
  fNoneResident: '',
  fSegmentType: '',
  fKIB: '',
}

describe('useFiltersStore — Add', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('возвращает пустой список при инициализации', () => {
    const store = useFiltersStore()

    expect(store.All()).toEqual([])
  })

  it('добавляет фильтр с автогенерацией id и пустыми полями', () => {
    const store = useFiltersStore()

    const filter = store.Add({ id: null, ...emptyFields })

    expect(filter).toMatchObject({ id: 1, ...emptyFields })
    expect(store.All()).toEqual([{ id: 1, ...emptyFields }])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([{ id: 1, ...emptyFields }])
  })
})

describe('useFiltersStore — Alter и Delete', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('обновляет существующий фильтр', () => {
    const store = useFiltersStore()

    store.Add(sampleFilter)
    store.Alter({ ...sampleFilter, fRoleInCase: 'Кредитор' })

    expect(store.All()).toEqual([{ ...sampleFilter, fRoleInCase: 'Кредитор' }])
  })

  it('удаляет фильтр по id', () => {
    const store = useFiltersStore()

    store.Add(sampleFilter)
    store.Add({ ...sampleFilter, id: 2, fRoleInCase: 'Гость' })
    store.Delete(1)

    expect(store.All()).toEqual([{ ...sampleFilter, id: 2, fRoleInCase: 'Гость' }])
  })
})