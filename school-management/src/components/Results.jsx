import React, { useState, useMemo } from 'react'

const sample = [
  { id: 1, name: 'Aisha Khan', className: '5A', marks: { math: 78, eng: 82, sci: 69 } },
  { id: 2, name: 'Rahul Mehta', className: '8B', marks: { math: 88, eng: 74, sci: 91 } },
  { id: 3, name: 'Sara Ali', className: '10C', marks: { math: 56, eng: 61, sci: 58 } },
  { id: 4, name: 'Tom Brown', className: '1A', marks: { math: 92, eng: 89, sci: 95 } }
]

function gradeFrom(totalPct) {
  if (totalPct >= 90) return 'A+'
  if (totalPct >= 80) return 'A'
  if (totalPct >= 70) return 'B'
  if (totalPct >= 60) return 'C'
  if (totalPct >= 50) return 'D'
  return 'F'
}

export default function Results() {
  const [exam, setExam] = useState('Midterm')
  const [classFilter, setClassFilter] = useState('All')
  const [rows, setRows] = useState(sample)

  const classes = useMemo(() => ['All', ...Array.from(new Set(sample.map((s) => s.className)))], [])

  function updateMark(id, subject, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, marks: { ...r.marks, [subject]: Number(value) } } : r)))
  }

  function exportCSV() {
    const headers = ['id', 'name', 'class', 'exam', 'math', 'eng', 'sci']
    const visible = rows.filter((r) => classFilter === 'All' || r.className === classFilter)
    const lines = [headers.join(',')]
    for (const r of visible) {
      lines.push([r.id, r.name, r.className, exam, r.marks.math, r.marks.eng, r.marks.sci].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exam.toLowerCase()}-results.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const visible = rows.filter((r) => classFilter === 'All' || r.className === classFilter)

  return (
    <div className="results-page">
      <div className="results-header">
        <div>
          <h2>Results</h2>
          <div className="muted">Enter marks and export results</div>
        </div>

        <div className="results-controls">
          <select value={exam} onChange={(e) => setExam(e.target.value)}>
            <option>Midterm</option>
            <option>Final</option>
          </select>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Class</th>
              <th>Math</th>
              <th>English</th>
              <th>Science</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const total = r.marks.math + r.marks.eng + r.marks.sci
              const pct = Math.round((total / 300) * 100)
              const grade = gradeFrom(pct)
              return (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.className}</td>
                  <td><input type="number" value={r.marks.math} min={0} max={100} onChange={(e) => updateMark(r.id, 'math', e.target.value)} /></td>
                  <td><input type="number" value={r.marks.eng} min={0} max={100} onChange={(e) => updateMark(r.id, 'eng', e.target.value)} /></td>
                  <td><input type="number" value={r.marks.sci} min={0} max={100} onChange={(e) => updateMark(r.id, 'sci', e.target.value)} /></td>
                  <td>{total} / 300 ({pct}%)</td>
                  <td className={`grade ${grade === 'F' ? 'fail' : 'pass'}`}>{grade}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
