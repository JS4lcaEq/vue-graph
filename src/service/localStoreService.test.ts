import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStoreService } from './localStoreService'

function resetInstances(): void {
  ;(LocalStoreService as unknown as { _instances: Map<string, LocalStoreService> })._instances.clear()
}

describe('LocalStoreService', () => {
  beforeEach(() => {
    resetInstances()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getInstance', () => {
    it('returns the same instance for the same selectorId', () => {
      const first = LocalStoreService.getInstance('user-A')
      const second = LocalStoreService.getInstance('user-A')

      expect(second).toBe(first)
    })

    it('returns different instances for different selectorIds', () => {
      const userA = LocalStoreService.getInstance('user-A')
      const userB = LocalStoreService.getInstance('user-B')

      expect(userB).not.toBe(userA)
    })
  })

  describe('getInstanceId', () => {
    it('returns the selectorId used to create the instance', () => {
      const service = LocalStoreService.getInstance('report-XYZ')

      expect(service.getInstanceId()).toBe('report-XYZ')
    })
  })

  describe('doSomethingSimple', () => {
    it('returns a message containing the selectorId', () => {
      const service = LocalStoreService.getInstance('test-id')

      expect(service.doSomethingSimple()).toBe('[test-id] Test Service running! ')
    })
  })

  describe('processData', () => {
    it('logs the input with the instance selectorId', () => {
      const service = LocalStoreService.getInstance('test-id')
      const input = { foo: 'bar' }

      service.processData(input)

      expect(console.log).toHaveBeenCalledWith('[test-id] Processing :', input)
    })
  })

  describe('save and load', () => {
    it('persists and retrieves data from localStorage', () => {
      const service = LocalStoreService.getInstance('storage-key')
      const data = { name: 'Alice', count: 42 }

      service.save(data)

      expect(localStorage.getItem('storage-key')).toBe(JSON.stringify(data))
      expect(service.load()).toEqual(data)
    })

    it('overwrites existing data on subsequent saves', () => {
      const service = LocalStoreService.getInstance('storage-key')

      service.save({ version: 1 })
      service.save({ version: 2 })

      expect(service.load()).toEqual({ version: 2 })
    })

    it('returns null when no data exists for the key', () => {
      const service = LocalStoreService.getInstance('missing-key')

      expect(service.load()).toBeNull()
      expect(console.warn).toHaveBeenCalledWith(
        '[LocalStoreService] No data found for key: missing-key',
      )
    })

    it('returns null and logs an error when stored data is invalid JSON', () => {
      localStorage.setItem('bad-json', 'not-valid-json')
      const service = LocalStoreService.getInstance('bad-json')

      expect(service.load()).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        '[LocalStoreService] Error loading data:',
        expect.any(SyntaxError),
      )
    })
  })

  describe('clear', () => {
    it('removes data from localStorage', () => {
      const service = LocalStoreService.getInstance('clear-key')
      service.save({ keep: false })

      service.clear()

      expect(localStorage.getItem('clear-key')).toBeNull()
      expect(service.load()).toBeNull()
      expect(console.log).toHaveBeenCalledWith(
        '[LocalStoreService] Key "clear-key" successfully cleared.',
      )
    })
  })

  describe('error handling', () => {
    it('logs an error when save fails', () => {
      const service = LocalStoreService.getInstance('save-error')
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded')
      })

      service.save({ data: 'test' })

      expect(console.error).toHaveBeenCalledWith(
        '[LocalStoreService] Error saving data:',
        expect.any(Error),
      )
    })

    it('logs an error when clear fails', () => {
      const service = LocalStoreService.getInstance('clear-error')
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      service.clear()

      expect(console.error).toHaveBeenCalledWith(
        '[LocalStoreService] Error clearing data:',
        expect.any(Error),
      )
    })
  })
})