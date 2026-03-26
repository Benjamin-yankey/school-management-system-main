import { describe, expect, it } from 'vitest'
import {
  generateAttendance,
  generateNotifications,
  generateQuickActions,
  generateRecentStudents,
  generateStats,
  generateUpcomingEvents
} from './dashboardData'

describe('dashboard data generators', () => {
  it('returns non-empty stats with required fields', () => {
    const stats = generateStats()
    expect(stats.length).toBeGreaterThan(0)

    for (const item of stats) {
      expect(item).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          value: expect.any(Number),
          change: expect.any(Number),
          color: expect.any(String),
          trend: expect.any(String)
        })
      )
    }
  })

  it('attendance percentages are within 0-100', () => {
    const attendance = generateAttendance()
    expect(attendance.length).toBeGreaterThan(0)

    for (const row of attendance) {
      expect(row.pct).toBeGreaterThanOrEqual(0)
      expect(row.pct).toBeLessThanOrEqual(100)
    }
  })

  it('recent students include id, name, and status', () => {
    const students = generateRecentStudents()
    expect(students.length).toBeGreaterThan(0)

    for (const student of students) {
      expect(student).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          status: expect.any(String)
        })
      )
    }
  })

  it('notifications and quick actions have ids', () => {
    const notifications = generateNotifications()
    const actions = generateQuickActions()

    expect(notifications.length).toBeGreaterThan(0)
    expect(actions.length).toBeGreaterThan(0)

    for (const item of notifications) {
      expect(item.id).toBeTypeOf('number')
    }
    for (const item of actions) {
      expect(item.id).toBeTypeOf('number')
    }
  })

  it('upcoming events include title and date', () => {
    const events = generateUpcomingEvents()
    expect(events.length).toBeGreaterThan(0)

    for (const event of events) {
      expect(event).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          date: expect.any(String)
        })
      )
    }
  })
})
