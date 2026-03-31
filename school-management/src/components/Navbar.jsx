import React from 'react'

export default function Navbar({ onNavigate, active }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'students', label: 'Students' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'results', label: 'Results' }
  ]

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="school-logo-container" style={{padding: '1rem'}}>
        <img src="/images/schoolLogo.jpeg" alt="School Logo" className="school-logo-img" />
        <span className="school-logo-text">GEOZIIE</span>
      </div>
      <ul className="nav-list" role="list">
        {items.map((it) => (
          <li key={it.key} role="listitem">
            <button
              type="button"
              className={`nav-item ${active === it.key ? 'active' : ''}`}
              onClick={() => onNavigate?.(it.key)}
              aria-current={active === it.key ? 'page' : undefined}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="nav-footer">v1.0</div>
    </nav>
  )
}
