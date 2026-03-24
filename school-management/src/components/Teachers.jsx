import React, { useState, useMemo, useEffect } from 'react'
import api from '../lib/api'

const initial = [
  { id: 1, name: 'Mr. Ahmed', subject: 'Math', className: '5A', phone: '555-0101' },
  { id: 2, name: 'Ms. Fatima', subject: 'English', className: '8B', phone: '555-0102' },
  { id: 3, name: 'Mr. Joseph', subject: 'Science', className: '10C', phone: '555-0103' }
]

export default function Teachers() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', subject: '', className: '', phone: '' })

  const subjects = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.subject)))], [rows])

  useEffect(() => {
    let mounted = true
    api.getTeachers().then((data) => {
      if (!mounted) return
      if (!data || data.length === 0) {
        api.saveTeachers(initial)
        setRows(initial)
      } else {
        setRows(data)
      }
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const visible = rows.filter((r) => {
    if (subjectFilter !== 'All' && r.subject !== subjectFilter) return false
    if (!query) return true
    const q = query.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.className.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || (r.phone || '').includes(q)
  })

  function startAdd() {
    setEditingId('new')
    setForm({ name: '', subject: '', className: '', phone: '' })
  }

  function startEdit(r) {
    setEditingId(r.id)
    setForm({ name: r.name, subject: r.subject, className: r.className, phone: r.phone })
  }

  function save() {
    if (!form.name.trim() || !form.subject.trim()) return
    if (editingId === 'new') {
      const id = Math.max(0, ...rows.map((r) => r.id)) + 1
      const next = [{ id, name: form.name.trim(), subject: form.subject.trim(), className: form.className.trim(), phone: form.phone.trim() }, ...rows]
      setRows(next)
      api.saveTeachers(next)
    } else {
      const next = rows.map((r) => (r.id === editingId ? { ...r, name: form.name.trim(), subject: form.subject.trim(), className: form.className.trim(), phone: form.phone.trim() } : r))
      setRows(next)
      api.saveTeachers(next)
    }
    setEditingId(null)
    setForm({ name: '', subject: '', className: '', phone: '' })
  }

  function cancel() {
    setEditingId(null)
    setForm({ name: '', subject: '', className: '', phone: '' })
  }

  function remove(id) {
    if (!confirm('Delete this teacher?')) return
    const next = rows.filter((r) => r.id !== id)
    setRows(next)
    api.saveTeachers(next)
  }

  function exportCSV() {
    const headers = ['id', 'name', 'subject', 'class', 'phone']
    const lines = [headers.join(',')]
    for (const r of visible) lines.push([r.id, `"${r.name.replace(/"/g, '""')}"`, r.subject, r.className, r.phone || ''].join(','))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `teachers.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="teachers-page">
      <div className="teachers-header">
        <div>
          <h2>Teachers</h2>
          <div className="muted">Manage teaching staff</div>
        </div>

        <div className="teachers-controls">
          <input placeholder="Search by name, subject, class or phone..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn" onClick={startAdd}>+ Add teacher</button>
          <button className="btn primary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="teachers-table-wrap">
        <table className="teachers-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr className="editing-row">
                <td>—</td>
                <td><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></td>
                <td><input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /></td>
                <td><input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} /></td>
                <td><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></td>
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
                <td>{editingId === r.id ? <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /> : r.subject}</td>
                <td>{editingId === r.id ? <input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} /> : r.className}</td>
                <td>{editingId === r.id ? <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /> : r.phone}</td>
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

