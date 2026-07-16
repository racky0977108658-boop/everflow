import { useEffect, useMemo, useState } from 'react'
import ProjectCard from '../components/ProjectCard.jsx'
import { supabase, isLive } from '../lib/supabase.js'
import { PROJECTS, CATEGORIES, normalizeRow } from '../data/seed.js'

export default function Home() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('全部')
  const [rows, setRows] = useState(PROJECTS)

  /** 已接上 Supabase 時改讀資料庫；query 防抖 250ms */
  useEffect(() => {
    if (!isLive) return
    const t = setTimeout(async () => {
      let query = supabase
        .from('ef_projects')
        .select('*, milestones:ef_milestones(*), tiers:ef_tiers(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (cat !== '全部') query = query.eq('category', cat)
      if (q.trim()) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
      const { data, error } = await query
      if (!error && data) setRows(data.map(normalizeRow))
    }, 250)
    return () => clearTimeout(t)
  }, [q, cat])

  /** 示範模式：前端過濾 */
  const list = useMemo(() => {
    if (isLive) return rows
    return PROJECTS.filter((p) => {
      const hitCat = cat === '全部' || p.category === cat
      const kw = q.trim()
      const hitQ = !kw || p.title.includes(kw) || p.summary.includes(kw)
      return hitCat && hitQ
    })
  }, [rows, q, cat])

  return (
    <>
      <section className="hero wrap rise">
        <p className="eyebrow">台灣原創・群眾集資</p>
        <h1>美好的事物，<br />值得如期抵達。</h1>
        <p className="lede">
          恆流是台灣原創作品的集資平台。藝術、設計、出版與科技的好計畫在這裡發生；
          每個計畫公開自己的進度，我們陪創作者走完全程，讓你安心等待作品到來。
        </p>
        <div className="hero-note">
          每個計畫都有一條公開的<b>進度軌道</b>，每一步都看得見
        </div>
      </section>

      <section className="wrap">
        <div className="toolbar">
          <div className="search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="搜尋計畫、提案者或關鍵字"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="搜尋計畫"
            />
          </div>
          <div className="chips" role="tablist" aria-label="分類篩選">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={'chip' + (c === cat ? ' on' : '')}
                onClick={() => setCat(c)}
                role="tab"
                aria-selected={c === cat}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="notice" style={{ margin: '24px 0 80px' }}>
            找不到符合「{q}」的計畫。試試其他關鍵字，或切換分類。
          </div>
        ) : (
          <div className="grid">
            {list.map((p) => <ProjectCard key={p.slug} p={p} />)}
          </div>
        )}
      </section>
    </>
  )
}
