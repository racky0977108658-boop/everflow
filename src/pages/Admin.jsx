import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isLive } from '../lib/supabase.js'
import { fmt } from '../data/seed.js'

const STATUS_ZH = { pending: '待審核', approved: '已核准', rejected: '已婉拒' }

export default function Admin() {
  const [phase, setPhase] = useState('loading') // loading | offline | anon | denied | ready
  const [subs, setSubs] = useState([])
  const [filter, setFilter] = useState('pending')
  const [notes, setNotes] = useState({})
  const [busyId, setBusyId] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('ef_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubs(data ?? [])
  }

  useEffect(() => {
    if (!isLive) { setPhase('offline'); return }
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) { setPhase('anon'); return }
      const { data: adm } = await supabase
        .from('ef_admins').select('user_id').eq('user_id', user.id).maybeSingle()
      if (!adm) { setPhase('denied'); return }
      setPhase('ready')
      load()
    })()
  }, [])

  async function decide(id, status) {
    setBusyId(id)
    await supabase.from('ef_submissions').update({
      status,
      review_note: (notes[id] || '').trim() || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    setBusyId(null)
    load()
  }

  if (phase === 'loading') return <div className="wrap" style={{ padding: '80px 0' }}><p className="muted">載入中</p></div>
  if (phase === 'offline') return <Gate title="示範模式" body="尚未連接資料庫，審核後台無法使用。" />
  if (phase === 'anon') return <Gate title="請先登入" body="審核後台僅限平台管理員。" cta={<Link className="btn" to="/auth">前往登入</Link>} />
  if (phase === 'denied') return <Gate title="沒有存取權限" body="此頁僅限平台管理員。若你是提案者，審核結果會以信件通知。" />

  const shown = subs.filter((s) => filter === 'all' || s.status === filter)
  const pendingCount = subs.filter((s) => s.status === 'pending').length

  return (
    <div className="wrap" style={{ padding: '48px 0 120px' }}>
      <p className="eyebrow">平台管理</p>
      <h1 style={{ fontSize: 'clamp(24px,3.5vw,34px)', margin: '8px 0 4px' }}>提案審核</h1>
      <p className="muted small">待審核 {pendingCount} 件・共 {subs.length} 件</p>

      <div className="chips" style={{ margin: '20px 0' }}>
        {['pending', 'approved', 'rejected', 'all'].map((k) => (
          <button key={k} className={'chip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>
            {k === 'all' ? '全部' : STATUS_ZH[k]}
          </button>
        ))}
      </div>

      {shown.length === 0 && <div className="notice">這個狀態目前沒有提案。</div>}

      <div style={{ display: 'grid', gap: 'var(--gap)' }}>
        {shown.map((s) => (
          <div key={s.id} className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <span className="badge">{s.category}</span>{' '}
                <span className={'badge' + (s.status === 'pending' ? ' gold' : '')}>{STATUS_ZH[s.status]}</span>
              </div>
              <span className="small muted">{new Date(s.created_at).toLocaleString('zh-TW')}</span>
            </div>
            <h3 style={{ margin: '12px 0 6px' }}>{s.title}</h3>
            <p className="muted" style={{ marginBottom: 8 }}>{s.summary}</p>
            {s.story && <p className="small" style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>{s.story}</p>}
            <p className="small muted">
              提案者：{s.proposer_name}・{s.contact_email}
              {s.goal ? `・目標 ${fmt(s.goal)}` : ''}
              {s.portfolio_url && <>・<a href={s.portfolio_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>作品連結</a></>}
            </p>
            {s.review_note && <div className="notice" style={{ marginTop: 10 }}>審核備註：{s.review_note}</div>}

            {s.status === 'pending' && (
              <>
                <div className="field" style={{ margin: '14px 0 10px' }}>
                  <label htmlFor={'note-' + s.id}>審核備註（會保留於紀錄，選填）</label>
                  <textarea id={'note-' + s.id} rows={2} value={notes[s.id] || ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                    placeholder="例如：請補充原型照片與供應商報價" />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn gold" disabled={busyId === s.id} onClick={() => decide(s.id, 'approved')}>核准</button>
                  <button className="btn ghost" disabled={busyId === s.id} onClick={() => decide(s.id, 'rejected')}>婉拒</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Gate({ title, body, cta }) {
  return (
    <div className="wrap" style={{ maxWidth: 520, padding: '80px 0 120px' }}>
      <h1 style={{ fontSize: 30, marginBottom: 10 }}>{title}</h1>
      <p className="muted" style={{ marginBottom: 20 }}>{body}</p>
      {cta}
    </div>
  )
}
