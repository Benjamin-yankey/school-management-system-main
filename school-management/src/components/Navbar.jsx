import React from 'react'
import { Building2, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ onNavigate, active }) {
  const { user, logout } = useAuth()
  const items = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'students', label: 'Students' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'results', label: 'Results' }
  ]

  return (
    <nav className="navbar" aria-label="Main navigation" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="school-logo-container" style={{padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
        <div className="school-logo-icon" style={{width: 32, height: 32, background: '#4c51bf', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <img src="/images/schoolLogo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
        </div>
        <span className="school-logo-text" style={{fontSize: '0.85rem', fontWeight: 800}}>GEOZIIE INTERNATIONAL</span>
      </div>
      <ul className="nav-list" role="list" style={{ flex: 1 }}>
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
      
      {user && (
        <div className="nav-user-footer" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff', fontSize: '0.85rem'
            }}>
              {user.avatar || (user.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
                {user.role} Portal
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
      {!user && <div className="nav-footer">v1.0</div>}
    </nav>
  )
}
