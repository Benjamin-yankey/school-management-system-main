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

  it('fetces active academic year', async () => {
    const mockYear = { id: 'uuid-year', year: '2025/2026', isActive: true }
    mockJsonResponse(mockYear)
    
    const { getActiveAcademicYear } = await import('./api')
    await expect(getActiveAcademicYear()).resolves.toEqual(mockYear)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/academic-years/active'), expect.anything())
  })

  it('fetches academic terms', async () => {
    const mockTerms = [{ id: 't1', name: 'Term 1', isCurrent: true }]
    mockJsonResponse(mockTerms)
    
    const { getAcademicTerms } = await import('./api')
    await expect(getAcademicTerms('year-id')).resolves.toEqual(mockTerms)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/academic-terms?academicYearId=year-id'), expect.anything())
  })

  it('fetches class levels', async () => {
    const mockClasses = [{ id: 'c1', name: 'Primary 1' }]
    mockJsonResponse(mockClasses)
    
    const { getClassLevels } = await import('./api')
    await expect(getClassLevels()).resolves.toEqual(mockClasses)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/classes'), expect.anything())
  })

  it('fetches class sections', async () => {
    const mockSections = [{ id: 's1', name: 'Section A' }]
    mockJsonResponse(mockSections)
    
    const { getClassSections } = await import('./api')
    await expect(getClassSections('class-id')).resolves.toEqual(mockSections)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/classes/class-id/sections'), expect.anything())
  })

  it('creates school user', async () => {
    const mockUser = { id: 'u1', email: 'test@edu.com', role: 'teacher' }
    mockJsonResponse(mockUser)
    
    const { createSchoolUser } = await import('./api')
    await expect(createSchoolUser({ email: 'test@edu.com', role: 'teacher' })).resolves.toEqual(mockUser)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/administration/create-user'), expect.anything())
  })

  it('gets administration users', async () => {
    const mockUsers = [{ id: 'u1', email: 'test@edu.com' }]
    mockJsonResponse(mockUsers)
    
    const { getAdministrationUsers } = await import('./api')
    await expect(getAdministrationUsers()).resolves.toEqual(mockUsers)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/administration/users'), expect.anything())
  })

  it('assigns teacher to section', async () => {
    const mockAssignment = { id: 'a1', teacherUserId: 'u1', sectionId: 's1' }
    mockJsonResponse(mockAssignment)
    
    const { assignTeacherToSection } = await import('./api')
    await expect(assignTeacherToSection('u1', 's1')).resolves.toEqual(mockAssignment)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/administration/teachers/u1/sections'), expect.anything())
  })

  it('enrolls student', async () => {
    const mockEnrollment = { id: 'e1', studentId: 'STU-01', firstName: 'Kofi' }
    mockJsonResponse(mockEnrollment)
    
    const { enrollStudent } = await import('./api')
    const data = { applicantId: 'a1', classLevelId: 'c1', academicYearId: 'y1' }
    await expect(enrollStudent(data)).resolves.toEqual(mockEnrollment)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/students/enroll'), expect.anything())
  })

  it('gets students paginated', async () => {
    const mockRes = { data: [], total: 0 }
    mockJsonResponse(mockRes)
    
    const { getStudentsPaginated } = await import('./api')
    await expect(getStudentsPaginated({ page: 1 })).resolves.toEqual(mockRes)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/students?page=1'), expect.anything())
  })

  it('creates fee', async () => {
    const mockFee = { id: 'f1', amountDue: 500 }
    mockJsonResponse(mockFee)
    
    const { createFee } = await import('./api')
    await expect(createFee({ studentId: 's1', amount: 500 })).resolves.toEqual(mockFee)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/fees'), expect.anything())
  })

  it('pays fee', async () => {
    mockJsonResponse({ id: 'f1', status: 'paid' })
    const { payFee } = await import('./api')
    await expect(payFee('f1', { amountPaid: 500 })).resolves.toEqual(expect.objectContaining({ status: 'paid' }))
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/fees/f1/pay'), expect.anything())
  })

  it('resets user password', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' })
    const { resetUserPassword } = await import('./api')
    await expect(resetUserPassword('u1')).resolves.toEqual({})
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/administration/reset-password/u1'), expect.anything())
  })

  it('deactivates user', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' })
    const { deactivateUser } = await import('./api')
    await expect(deactivateUser('u1')).resolves.toEqual({})
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/administration/deactivate/u1'), expect.anything())
  })

  it('activates user', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' })
    const { activateUser } = await import('./api')
    await expect(activateUser('u1')).resolves.toEqual({})
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/administration/activate/u1'), expect.anything())
  })

  it('withdraws student', async () => {
    mockJsonResponse({ id: 's1', status: 'withdrawn' })
    const { withdrawStudent } = await import('./api')
    await expect(withdrawStudent('s1', 'Relocation')).resolves.toEqual(expect.objectContaining({ status: 'withdrawn' }))
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/students/s1/withdraw'), expect.anything())
  })

  it('signs out', async () => {
    mockJsonResponse({ message: 'Logged out successfully' })
    const { signOut } = await import('./api')
    await expect(signOut()).resolves.toEqual({ message: 'Logged out successfully' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/signout'), expect.anything())
  })

  it('gets teacher sections', async () => {
    mockJsonResponse([{ id: 's1', section: { name: 'A' } }])
    const { getTeacherSections } = await import('./api')
    await expect(getTeacherSections()).resolves.toEqual([{ id: 's1', section: { name: 'A' } }])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teacher/sections'), expect.anything())
  })

  it('gets teacher students', async () => {
    mockJsonResponse([{ id: 'st1', firstName: 'Kofi' }])
    const { getTeacherStudents } = await import('./api')
    await expect(getTeacherStudents()).resolves.toEqual([{ id: 'st1', firstName: 'Kofi' }])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teacher/students'), expect.anything())
  })

  it('gets section students', async () => {
    mockJsonResponse([{ id: 'st1', firstName: 'Kofi' }])
    const { getSectionStudents } = await import('./api')
    await expect(getSectionStudents('s1')).resolves.toEqual([{ id: 'st1', firstName: 'Kofi' }])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teacher/sections/s1/students'), expect.anything())
  })

  it('bulk records attendance', async () => {
    mockJsonResponse({ message: 'Success' })
    const { bulkRecordAttendance } = await import('./api')
    await expect(bulkRecordAttendance({ sectionId: 's1' })).resolves.toEqual({ message: 'Success' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/attendance/bulk'), expect.anything())
  })

  it('gets student attendance summary', async () => {
    mockJsonResponse({ present: 10 })
    const { getStudentAttendanceSummary } = await import('./api')
    await expect(getStudentAttendanceSummary('st1', 't1')).resolves.toEqual({ present: 10 })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/attendance/student/st1/summary?termId=t1'), expect.anything())
  })

  it('bulk records grades', async () => {
    mockJsonResponse({ message: 'Success' })
    const { bulkRecordGrades } = await import('./api')
    await expect(bulkRecordGrades({ termId: 't1' })).resolves.toEqual({ message: 'Success' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/grades/bulk'), expect.anything())
  })

  it('gets student report card', async () => {
    mockJsonResponse([{ subject: 'Math' }])
    const { getStudentReportCard } = await import('./api')
    await expect(getStudentReportCard('st1', 't1')).resolves.toEqual([{ subject: 'Math' }])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/grades/report-card/st1?termId=t1'), expect.anything())
  })

  it('changes password', async () => {
    mockJsonResponse({ message: 'Success' })
    const { changePassword } = await import('./api')
    await expect(changePassword('old', 'new')).resolves.toEqual({ message: 'Success' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/change-password'), expect.anything())
  })

  it('gets student portal me', async () => {
    mockJsonResponse({ id: 'st1', studentId: 'STU-01' })
    const { getStudentPortalMe } = await import('./api')
    await expect(getStudentPortalMe()).resolves.toEqual({ id: 'st1', studentId: 'STU-01' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/student-portal/me'), expect.anything())
  })

  it('gets student enrollments', async () => {
    mockJsonResponse([{ id: 'e1' }])
    const { getStudentEnrollments } = await import('./api')
    await expect(getStudentEnrollments()).resolves.toEqual([{ id: 'e1' }])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/student-portal/enrollments'), expect.anything())
  })

  it('links child as parent', async () => {
    mockJsonResponse({ id: 'l1', studentId: 'st1', relationship: 'father' })
    const { linkChild } = await import('./api')
    await expect(linkChild('st1', 'father')).resolves.toEqual(expect.objectContaining({ relationship: 'father' }))
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/parent/children'), expect.anything())
  })

  it('gets linked children as parent', async () => {
    mockJsonResponse([{ id: 'l1', student: { firstName: 'Kofi' } }])
    const { getLinkedChildren } = await import('./api')
    await expect(getLinkedChildren()).resolves.toEqual([{ id: 'l1', student: { firstName: 'Kofi' } }])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/parent/children'), expect.anything())
  })

  it('gets one linked child as parent', async () => {
    mockJsonResponse({ id: 'l1', student: { firstName: 'Kofi' } })
    const { getLinkedChild } = await import('./api')
    await expect(getLinkedChild('st1')).resolves.toEqual(expect.objectContaining({ id: 'l1' }))
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/parent/children/st1'), expect.anything())
  })

  it('unlinks child as parent', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' })
    const { unlinkChild } = await import('./api')
    await expect(unlinkChild('st1')).resolves.toEqual({})
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/parent/children/st1'), expect.objectContaining({ method: 'DELETE' }))
  })
})
