import React, { useState, useMemo, useEffect } from 'react'
import api from '../lib/api'

const initial = [
  { id: 1, name: 'Aisha Khan', className: '5A', roll: 12 },
  { id: 2, name: 'Rahul Mehta', className: '8B', roll: 23 },
  { id: 3, name: 'Sara Ali', className: '10C', roll: 5 },
  { id: 4, name: 'Tom Brown', className: '1A', roll: 2 }
]

export default function Students() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', className: '', roll: '' })

  const classes = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.className)))], [rows])

  useEffect(() => {
    let mounted = true
    api.getStudents().then((data) => {
      if (!mounted) return
      if (!data || data.length === 0) {
        api.saveStudents(initial)
        setRows(initial)
      } else {
        setRows(data)
      }
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const visible = rows.filter((r) => {
    if (classFilter !== 'All' && r.className !== classFilter) return false
    if (!query) return true
    const q = query.toLowerCase()
    return r.name.toLowerCase().includes(q) || String(r.roll).includes(q) || r.className.toLowerCase().includes(q)
  })

  function startAdd() {
    setEditingId('new')
    setForm({ name: '', className: '', roll: '' })
  }

  function startEdit(r) {
    setEditingId(r.id)
    setForm({ name: r.name, className: r.className, roll: r.roll })
  }

  function save() {
    if (!form.name.trim() || !form.className.trim()) return
    if (editingId === 'new') {
      const id = Math.max(0, ...rows.map((r) => r.id)) + 1
      const next = [{ id, name: form.name.trim(), className: form.className.trim(), roll: Number(form.roll) || 0 }, ...rows]
      setRows(next)
      api.saveStudents(next)
    } else {
      const next = rows.map((r) => (r.id === editingId ? { ...r, name: form.name.trim(), className: form.className.trim(), roll: Number(form.roll) || 0 } : r))
      setRows(next)
      api.saveStudents(next)
    }
    setEditingId(null)
    setForm({ name: '', className: '', roll: '' })
  }

  function cancel() {
    setEditingId(null)
    setForm({ name: '', className: '', roll: '' })
  }

  function remove(id) {
    if (!confirm('Delete this student?')) return
    const next = rows.filter((r) => r.id !== id)
    setRows(next)
    api.saveStudents(next)
  }

  function exportCSV() {
    const headers = ['id', 'name', 'class', 'roll']
    const lines = [headers.join(',')]
    for (const r of visible) lines.push([r.id, `"${r.name.replace(/"/g, '""')}"`, r.className, r.roll].join(','))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <h2>Students</h2>
          <div className="muted">Manage student records</div>
        </div>

        <div className="students-controls">
          <input placeholder="Search by name, class or roll..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={startAdd}>+ Add student</button>
          <button className="btn primary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="students-table-wrap">
        <table className="students-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Class</th>
              <th>Roll</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr className="editing-row">
                <td>—</td>
                <td><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></td>
                <td><input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} /></td>
                <td><input value={form.roll} onChange={(e) => setForm((f) => ({ ...f, roll: e.target.value }))} /></td>
                <td>
                  <button className="btn" onClick={cancel}>Cancel</button>
                  <button className="btn primary" onClick={save}>Save</button>
                </td>
              </tr>
            )}

            {visible.map((r, i) => (
              <tr key={r.id} className={editingId === r.id ? 'editing-row' : ''}>
                <td>{i + 1}</td>
                <td>{editingId === r.id ? <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /> : r.name}</td>
                <td>{editingId === r.id ? <input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} /> : r.className}</td>
                <td>{editingId === r.id ? <input value={form.roll} onChange={(e) => setForm((f) => ({ ...f, roll: e.target.value }))} /> : r.roll}</td>
                <td>
                  {editingId === r.id ? (
                    <>
                      <button className="btn" onClick={cancel}>Cancel</button>
                      <button className="btn primary" onClick={save}>Save</button>
                    </>
                  ) : (
                    <>
                      <button className="btn" onClick={() => startEdit(r)}>Edit</button>
                      <button className="btn" onClick={() => remove(r.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
