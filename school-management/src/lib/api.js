// Minimal API client that uses localStorage as a fallback.
// Your backend developer can replace these with real fetch/axios calls.

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore
  }
}

export async function getStudents() {
  return read('students', [])
}

export async function saveStudents(rows) {
  write('students', rows)
  return rows
}

export async function getTeachers() {
  return read('teachers', [])
}

export async function saveTeachers(rows) {
  write('teachers', rows)
  return rows
}

export async function getAttendance(date) {
  const all = read('attendance', {})
  return all[date] || {}
}

export async function saveAttendance(date, map) {
  const all = read('attendance', {})
  all[date] = map
  write('attendance', all)
  return map
}

export default { getStudents, saveStudents, getTeachers, saveTeachers, getAttendance, saveAttendance }
