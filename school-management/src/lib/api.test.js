import { beforeEach, describe, expect, it } from 'vitest'
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

  it('overwrites students when saving again', async () => {
    await saveStudents([{ id: 1, name: 'Old Name' }])
    await saveStudents([{ id: 2, name: 'New Name' }])

    await expect(getStudents()).resolves.toEqual([{ id: 2, name: 'New Name' }])
  })

  it('saves and reads teachers', async () => {
    const rows = [
      { id: 1, name: 'Ms. Adu' },
      { id: 2, name: 'Mr. Boateng' }
    ]

    await saveTeachers(rows)
    await expect(getTeachers()).resolves.toEqual(rows)
  })

  it('keeps attendance isolated by date', async () => {
    await saveAttendance('2026-03-25', { '1': true })
    await saveAttendance('2026-03-26', { '1': false })

    await expect(getAttendance('2026-03-25')).resolves.toEqual({ '1': true })
    await expect(getAttendance('2026-03-26')).resolves.toEqual({ '1': false })
  })

  it('returns fallback when stored JSON is invalid', async () => {
    localStorage.setItem('students', '{bad json')

    await expect(getStudents()).resolves.toEqual([])
  })
})
