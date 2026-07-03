import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTasksStore } from './tasks'

const STORAGE_KEY = 'tasks-data'

describe('useTasksStore — Alter: добавление', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('автогенерирует id=2 для второй задачи, если первая добавлена с id=1', () => {
    const store = useTasksStore()

    expect(store.All()).toEqual([])

    store.Alter({ id: 1, nm: 'Task name 1', duration: null })
    store.Alter({ id: null, nm: 'Task name 2', duration: null })

    expect(store.All()[1]).toMatchObject({ id: 2 })

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(2)
  })

  it('автогенерирует nm при добавлении без имени', () => {
    const store = useTasksStore()

    const task = store.Alter({ id: 1, nm: null, duration: null })

    expect(store.All()[0]).toMatchObject({ id: 1, nm: 'Task name 1', duration: 1 })
    expect(task).toMatchObject({ id: 1, nm: 'Task name 1', duration: 1 })
  })

  it('автогенерирует duration при добавлении без длительности', () => {
    const store = useTasksStore()

    const task = store.Alter({ id: 1, nm: 'Задача', duration: null })

    expect(task.duration).toBe(1)
  })

  it('добавляет задачу с заданным id, если её ещё нет', () => {
    const store = useTasksStore()

    store.Alter({ id: 5, nm: 'Пятая', duration: 3 })

    expect(store.All()).toEqual([{ id: 5, nm: 'Пятая', duration: 3 }])
  })
})

describe('useTasksStore — Get', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('возвращает задачу по id из индекса', () => {
    const store = useTasksStore()

    store.Alter({ id: 1, nm: 'Task name 1', duration: null })
    store.Alter({ id: 2, nm: 'Task name 2', duration: null })

    expect(store.Get(1)).toMatchObject({ id: 1, nm: 'Task name 1', duration: 1 })
    expect(store.Get(2)).toMatchObject({ id: 2, nm: 'Task name 2', duration: 1 })
  })

  it('возвращает undefined для несуществующего id', () => {
    const store = useTasksStore()

    store.Alter({ id: 1, nm: 'Task name 1', duration: null })

    expect(store.Get(99)).toBeUndefined()
  })

  it('возвращает undefined после Delete', () => {
    const store = useTasksStore()

    store.Alter({ id: 1, nm: 'Task name 1', duration: null })
    store.Delete(1)

    expect(store.Get(1)).toBeUndefined()
  })
})

describe('useTasksStore — Alter: обновление', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('обновляет существующую задачу по id', () => {
    const store = useTasksStore()

    store.Alter({ id: 1, nm: 'Task name 1', duration: null })
    const updated = store.Alter({ id: 1, nm: 'Обновлённая', duration: 5 })

    expect(store.All()).toEqual([{ id: 1, nm: 'Обновлённая', duration: 5 }])
    expect(updated).toMatchObject({ id: 1, nm: 'Обновлённая', duration: 5 })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([{ id: 1, nm: 'Обновлённая', duration: 5 }])
  })
})