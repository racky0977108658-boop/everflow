import { useEffect, useState } from 'react'
import { supabase, isLive } from '../lib/supabase.js'
import { CATEGORIES } from '../data/seed.js'

const CATS = CATEGORIES.filter((c) => c !== '全部')

export default function Start() {
  const [user, setUser] = useState(null)
  const [f, setF] = useState({
    proposer_name: '', contact_email: '', title: '', category: CATS[0],
    summary: '', story: '', goal: '', portfolio_url: '',
  })
  const [agree, setAgree] = useState(false)
  const [state, setState] = useState({ busy: false, done: false, err: null })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user ?? null
      setUser(u)
      if (u?.email) setF((x) => ({ ...x, contact_email: x.contact_email || u.email }))
    })
  }, [])

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function submit() {
    if (!f.proposer_name || !f.title || !f.summary || !f.contact_email.includes('@')) {
      setState({ busy: false, done: false, err: '請至少填寫提案者名稱、有效信箱、計畫名稱與一句話簡介。' })
      return
    }
    if (!agree) {
      setState({ busy: false, done: false, err: '送出前請勾選原創聲明。' })
      return
    }
    if (!isLive) {
      setState({ busy: false, done: false, err: '示範模式：尚未連接資料庫，無法送出。' })
      return
    }
    setState({ busy: true, done: false, err: null })
    const goal = parseInt(f.goal, 10)
    const { error } = await supabase.from('ef_submissions').insert({
      owner: user?.id ?? null,
      proposer_name: f.proposer_name.trim(),
      contact_email: f.contact_email.trim(),
      title: f.title.trim(),
      category: f.category,
      summary: f.summary.trim(),
      story: f.story.trim() || null,
      goal: Number.isFinite(goal) && goal > 0 ? goal : null,
      portfolio_url: f.portfolio_url.trim() || null,
      status: 'pending',
    })
    setState(error
      ? { busy: false, done: false, err: '送出失敗，請稍後再試。' }
      : { busy: false, done: true, err: null })
  }

  if (state.done) {
    return (
      <div className="wrap" style={{ maxWidth: 640, padding: '64px 0 120px' }}>
        <p className="eyebrow">發起計畫</p>
        <h1 style={{ fontSize: 32, margin: '8px 0 16px' }}>提案已送出</h1>
        <div className="notice ok">
          我們已收到你的計畫。平台會進行原創與可行性初審，通常於五個工作日內
          以信件回覆審核結果與下一步；通過後將由專人協助你完成計畫頁與回饋方案設定。
        </div>
      </div>
    )
  }

  return (
    <div className="wrap" style={{ maxWidth: 640, padding: '48px 0 120px' }}>
      <p className="eyebrow">發起計畫</p>
      <h1 style={{ fontSize: 'clamp(26px,4vw,36px)', margin: '8px 0 10px' }}>
        有一件想完成的作品嗎？
      </h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        先告訴我們計畫的樣子。送出後由平台初審，通過後才進入建頁與上線流程；
        審核重點是原創性與實現路徑，不是完成度。
      </p>

      <div className="panel">
        <div className="field">
          <label htmlFor="s-name">提案者名稱（個人或團隊）</label>
          <input id="s-name" value={f.proposer_name} onChange={set('proposer_name')} placeholder="例如：初野工作室" />
        </div>
        <div className="field">
          <label htmlFor="s-mail">聯絡信箱</label>
          <input id="s-mail" type="email" value={f.contact_email} onChange={set('contact_email')} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="s-title">計畫名稱</label>
          <input id="s-title" value={f.title} onChange={set('title')} placeholder="例如：曜壺 Lumen Vessel 手工琉璃茶器" />
        </div>
        <div className="field">
          <label htmlFor="s-cat">分類</label>
          <select id="s-cat" value={f.category} onChange={set('category')}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="s-sum">一句話簡介</label>
          <input id="s-sum" value={f.summary} onChange={set('summary')} placeholder="用一句話說明這是什麼、為誰而做" />
        </div>
        <div className="field">
          <label htmlFor="s-story">計畫說明（選填）</label>
          <textarea id="s-story" rows={5} value={f.story} onChange={set('story')}
            placeholder="想做什麼、為什麼是你、目前進度到哪裡、預計如何實現" />
        </div>
        <div className="field">
          <label htmlFor="s-goal">目標金額（新台幣，選填）</label>
          <input id="s-goal" type="number" inputMode="numeric" min="1" value={f.goal} onChange={set('goal')} placeholder="300000" />
        </div>
        <div className="field">
          <label htmlFor="s-url">作品集或原型連結（選填）</label>
          <input id="s-url" type="url" value={f.portfolio_url} onChange={set('portfolio_url')} placeholder="https://" />
        </div>

        <label className="checkline">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          我聲明本計畫為原創或已取得合法授權，理解平台將進行原創比對與實名審核，
          且上線前不得含有牴觸消費者保護法之條款。
        </label>

        {state.err && <div className="notice err" style={{ margin: '14px 0' }}>{state.err}</div>}

        <button className="btn gold block" style={{ marginTop: 10 }} onClick={submit} disabled={state.busy}>
          {state.busy ? '送出中' : '送出提案'}
        </button>
        {!user && (
          <p className="small muted" style={{ marginTop: 12 }}>
            尚未登入也可以先送出提案；之後完成登入與實名驗證，才能正式上線集資。
          </p>
        )}
      </div>
    </div>
  )
}
