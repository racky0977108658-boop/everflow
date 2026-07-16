import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Header() {
  const [user, setUser] = useState(null)

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
        <Link to="/" className="brand">恆流 <em>EverFlow</em></Link>
        <nav className="nav">
          <Link to="/">探索計畫</Link>
          <Link to="/dashboard">提案者後台</Link>
          <Link to="/legal">保障規則</Link>
          {user ? (
            <button className="btn ghost" onClick={() => supabase.auth.signOut()}>登出</button>
          ) : (
            <Link to="/auth" className="btn">登入</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
