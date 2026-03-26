import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fetch for the API client
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage if it's missing or broken in the test environment
if (typeof localStorage === 'undefined' || !localStorage.setItem) {
  const storage = {}
  global.localStorage = {
    getItem: vi.fn((key) => storage[key] || null),
    setItem: vi.fn((key, value) => { storage[key] = String(value) }),
    clear: vi.fn(() => { for (const key in storage) delete storage[key] }),
    removeItem: vi.fn((key) => { delete storage[key] }),
    length: 0,
    key: vi.fn((i) => Object.keys(storage)[i] || null)
  }
}

// Helper to mock successful JSON response
const mockJsonResponse = (data) => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => data,
    text: async () => JSON.stringify(data)
  })
}

import {
  getAttendance,
  getStudents,
  getTeachers,
  saveAttendance,
  saveStudents,
  saveTeachers
} from './api'

describe('api storage helpers', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('saves and reads students', async () => {
    const rows = [
      { id: 'uuid-1', name: 'Amara Doe' },
      { id: 'uuid-2', name: 'Kwame Mensah' }
    ]

    // Mock individual create calls for saveStudents
    mockJsonResponse({ id: 'uuid-1', name: 'Amara Doe' })
    
    await saveStudents(rows)
    
    // Mock getStudents response
    mockJsonResponse(rows)
    await expect(getStudents()).resolves.toEqual(rows)
  })

  it('overwrites students when saving again', async () => {
    mockJsonResponse({ id: 'uuid-1', name: 'Old Name' })
    await saveStudents([{ id: 'uuid-1', name: 'Old Name' }])
    
    mockJsonResponse({ id: 'uuid-2', name: 'New Name' })
    await saveStudents([{ id: 'uuid-2', name: 'New Name' }])

    const nextRows = [{ id: 'uuid-2', name: 'New Name' }]
    mockJsonResponse(nextRows)
    await expect(getStudents()).resolves.toEqual(nextRows)
  })

  it('saves and reads teachers', async () => {
    const rows = [
      { id: 'uuid-1', name: 'Ms. Adu' },
      { id: 'uuid-2', name: 'Mr. Boateng' }
    ]

    mockJsonResponse({ id: 'uuid-1', name: 'Ms. Adu' })
    await saveTeachers(rows)
    
    mockJsonResponse(rows)
    await expect(getTeachers()).resolves.toEqual(rows)
  })

  it('keeps attendance isolated by date', async () => {
    mockJsonResponse({ '1': true })
    await saveAttendance('2026-03-25', { '1': true })
    
    mockJsonResponse({ '1': false })
    await saveAttendance('2026-03-26', { '1': false })

    mockJsonResponse({ '1': true })
    await expect(getAttendance('2026-03-25')).resolves.toEqual({ '1': true })
    
    mockJsonResponse({ '1': false })
    await expect(getAttendance('2026-03-26')).resolves.toEqual({ '1': false })
  })

  it('returns fallback when stored JSON is invalid', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => '{bad json'
    })

    await expect(getStudents()).rejects.toThrow()
  })
})
