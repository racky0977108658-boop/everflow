import { useState } from 'react'
import { supabase, isLive } from '../lib/supabase.js'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ busy: false, msg: null, err: null })

  async function sendLink(e) {
    e.preventDefault()
    if (!isLive) {
      setState({ busy: false, msg: null, err: '示範模式：尚未連接 Supabase。於環境變數填入 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY 後即可登入。' })
      return
    }
    setState({ busy: true, msg: null, err: null })
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    setState(error
      ? { busy: false, msg: null, err: '寄送失敗，請確認信箱是否正確後再試一次。' }
      : { busy: false, err: null, msg: '登入連結已寄出，請到信箱點擊連結完成登入。' })
  }

  async function google() {
    if (!isLive) {
      setState({ busy: false, msg: null, err: '示範模式：尚未連接 Supabase，無法使用 Google 登入。' })
      return
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
  }

  return (
    <div className="wrap" style={{ maxWidth: 440, padding: '64px 0 100px' }}>
      <p className="eyebrow">會員</p>
      <h1 style={{ fontSize: 32, margin: '8px 0 8px' }}>登入恆流</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        不設密碼。我們寄一封一次性登入連結給您，點擊即完成登入。
      </p>

      <form onSubmit={sendLink} className="panel">
        <div className="field">
          <label htmlFor="auth-email">電子信箱</label>
          <input id="auth-email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <button className="btn block" disabled={state.busy}>
          {state.busy ? '寄送中' : '寄送登入連結'}
        </button>
        <div style={{ textAlign: 'center', margin: '14px 0' }} className="small muted">或</div>
        <button type="button" className="btn ghost block" onClick={google}>
          使用 Google 帳號登入
        </button>
        {state.err && <div className="notice err" style={{ marginTop: 14 }}>{state.err}</div>}
        {state.msg && <div className="notice ok" style={{ marginTop: 14 }}>{state.msg}</div>}
      </form>

      <p className="small muted" style={{ marginTop: 16 }}>
        提案者須另完成實名驗證（自然人憑證或公司登記文件）後才能發起計畫並收取撥款。
      </p>
    </div>
  )
}
