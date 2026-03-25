import { beforeEach, describe, expect, it } from 'vitest'
import { getAttendance, getStudents, saveAttendance, saveStudents } from './api'

describe('api storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and reads students', async () => {
    const rows = [
      { id: 1, name: 'Amara Doe' },
      { id: 2, name: 'Kwame Mensah' }
    ]

    await saveStudents(rows)
    await expect(getStudents()).resolves.toEqual(rows)
  })

  it('saves and reads attendance by date', async () => {
    const date = '2026-03-25'
    const map = { '1': true, '2': false }

    await saveAttendance(date, map)
    await expect(getAttendance(date)).resolves.toEqual(map)
  })
})
