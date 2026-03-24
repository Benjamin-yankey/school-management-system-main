import React, { useState, useMemo } from 'react'

const sampleStudents = [
  { id: 1, name: 'Aisha Khan', className: '5A' },
  { id: 2, name: 'Rahul Mehta', className: '8B' },
  { id: 3, name: 'Sara Ali', className: '10C' },
  { id: 4, name: 'Tom Brown', className: '1A' },
  { id: 5, name: 'Lina Gomez', className: '5A' },
  { id: 6, name: 'Omar Faruk', className: '8B' }
]

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

export default function Attendance() {
  const [date, setDate] = useState(formatDate(new Date()))
  const [classFilter, setClassFilter] = useState('All')
  const [attendance, setAttendance] = useState(() => {
    const map = new Map()
    for (const s of sampleStudents) map.set(s.id, true)
    return map
  })

  const classes = useMemo(() => {
    const set = new Set(sampleStudents.map((s) => s.className))
    return ['All', ...Array.from(set).sort()]
  }, [])

  const visible = sampleStudents.filter((s) => classFilter === 'All' || s.className === classFilter)

  function toggle(id) {
    setAttendance((prev) => new Map(prev).set(id, !prev.get(id)))
  }

  function bulkSet(value) {
    setAttendance((prev) => {
      const next = new Map(prev)
      for (const s of visible) next.set(s.id, value)
      return next
    })
  }

  function exportCSV() {
    const rows = [['id', 'name', 'class', 'date', 'present']]
    for (const s of visible) rows.push([s.id, s.name, s.className, date, attendance.get(s.id) ? '1' : '0'])
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h2>Attendance</h2>
          <div className="muted">Mark daily attendance and export records</div>
        </div>

        <div className="attendance-controls">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="btn" onClick={() => bulkSet(true)}>Mark All Present</button>
          <button className="btn" onClick={() => bulkSet(false)}>Mark All Absent</button>
          <button className="btn primary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="attendance-list">
        <table className="attendance-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id} className="attendance-row">
                <td>
                  <input type="checkbox" checked={!!attendance.get(s.id)} onChange={() => toggle(s.id)} />
                </td>
                <td>{s.name}</td>
                <td>{s.className}</td>
                <td className={attendance.get(s.id) ? 'present' : 'absent'}>{attendance.get(s.id) ? 'Present' : 'Absent'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
