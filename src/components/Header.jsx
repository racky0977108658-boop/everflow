import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const LINKS = [
  { to: '/', label: '探索計畫' },
  { to: '/dashboard', label: '提案者後台' },
  { to: '/legal', label: '保障規則' },
]

export default function Header() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub?.subscription?.unsubscribe()
  }, [])

  return (
    <header className="site-header">
      <div className="wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>恆流 <em>EverFlow</em></Link>
        <nav className="nav">
          <div className="nav-links">
            {LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          </div>
          {user ? (
            <button className="btn ghost compact" onClick={() => supabase.auth.signOut()}>登出</button>
          ) : (
            <Link to="/auth" className="btn compact">登入</Link>
          )}
          <button
            className="menu-btn"
            aria-label="開啟選單"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '✕' : '☰'}
          </button>
        </nav>
      </div>
      {open && (
        <div className="mobile-menu" role="menu">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} role="menuitem" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
