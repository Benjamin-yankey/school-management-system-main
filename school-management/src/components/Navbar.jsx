import React from 'react'
import { Building2 } from 'lucide-react'

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
      <div className="school-logo-container" style={{padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
        <div className="school-logo-icon" style={{width: 32, height: 32, background: '#4c51bf', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Building2 size={18} color="#fff" />
        </div>
        <span className="school-logo-text" style={{fontSize: '0.85rem', fontWeight: 800}}>GEOZIIE INTERNATIONAL</span>
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
