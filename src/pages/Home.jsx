import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard.jsx'
import { supabase, isLive } from '../lib/supabase.js'
import { PROJECTS, CATEGORIES, normalizeRow } from '../data/seed.js'

const PAGE = 8

export default function Home() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('全部')
  const [rows, setRows] = useState(PROJECTS)
  const [visible, setVisible] = useState(PAGE)
  const sentinel = useRef(null)

  /** 已接上 Supabase 時改讀資料庫；query 防抖 250ms */
  useEffect(() => {
    if (!isLive) return
    const t = setTimeout(async () => {
      let query = supabase
        .from('ef_projects')
        .select('*, milestones:ef_milestones(*), tiers:ef_tiers(*)')
        .in('status', ['published', 'funded', 'completed'])
        .order('created_at', { ascending: false })
        .limit(60)
      if (cat !== '全部') query = query.eq('category', cat)
      if (q.trim()) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
      const { data, error } = await query
      if (!error && data) setRows(data.map(normalizeRow))
    }, 250)
    return () => clearTimeout(t)
  }, [q, cat])

  /** 示範模式：前端過濾 */
  const list = useMemo(() => {
    const base = isLive ? rows : PROJECTS.filter((p) => {
      const hitCat = cat === '全部' || p.category === cat
      const kw = q.trim()
      const hitQ = !kw || p.title.includes(kw) || p.summary.includes(kw)
      return hitCat && hitQ
    })
    return base
  }, [rows, q, cat])

  const browsing = q.trim() !== '' || cat !== '全部'
  const live = list.filter((p) => p.status !== 'completed')
  const done = list.filter((p) => p.status === 'completed')
  const featured = [...live].sort((a, b) => b.raised - a.raised).slice(0, 4)
  const closing = [...live].filter((p) => (p.days_left ?? 99) <= 14).sort((a, b) => a.days_left - b.days_left).slice(0, 6)
  const fresh = [...live].filter((p) => !featured.includes(p)).slice(0, 8)

  /** 無限捲動：哨兵進入視窗就加載下一頁 */
  useEffect(() => { setVisible(PAGE) }, [q, cat])
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => Math.min(v + PAGE, list.length))
    }, { rootMargin: '400px' })
    ob.observe(el)
    return () => ob.disconnect()
  }, [list.length])

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
      </section>

      {/* 搜尋或篩選中：單一結果流（無限捲動） */}
      {browsing ? (
        <section className="wrap">
          {list.length === 0 ? (
            <div className="notice" style={{ margin: '24px 0 80px' }}>
              找不到符合的計畫。試試其他關鍵字，或切換分類。
            </div>
          ) : (
            <>
              <div className="grid" style={{ paddingBottom: 24 }}>
                {list.slice(0, visible).map((p) => <ProjectCard key={p.slug} p={p} />)}
              </div>
              <div ref={sentinel} aria-hidden="true" />
              <p className="small muted" style={{ textAlign: 'center', padding: '0 0 64px' }}>
                {visible >= list.length ? `共 ${list.length} 個計畫` : '往下捲動載入更多'}
              </p>
            </>
          )}
        </section>
      ) : (
        <>
          {/* 精選計畫 */}
          <Section eyebrow="Featured" title="本週精選">
            <div className="hrow">
              {featured.map((p) => <ProjectCard key={p.slug} p={p} />)}
            </div>
          </Section>

          {/* 即將截止 */}
          {closing.length > 0 && (
            <Section eyebrow="Closing Soon" title="即將截止" note="這些計畫只剩最後幾天">
              <div className="hrow">
                {closing.map((p) => <ProjectCard key={p.slug} p={p} />)}
              </div>
            </Section>
          )}

          {/* 最新上架 */}
          <Section eyebrow="New Arrivals" title="最新上架">
            <div className="grid" style={{ padding: '8px 0 8px' }}>
              {fresh.slice(0, visible).map((p) => <ProjectCard key={p.slug} p={p} />)}
            </div>
            <div ref={sentinel} aria-hidden="true" />
          </Section>

          {/* 已如期抵達 */}
          {done.length > 0 && (
            <Section eyebrow="Delivered" title="已如期抵達" note="走完全程的計畫，進度紀錄永久公開">
              <div className="hrow">
                {done.map((p) => <ProjectCard key={p.slug} p={p} />)}
              </div>
            </Section>
          )}

          {/* 平台流程 */}
          <section className="wrap section">
            <p className="eyebrow">How It Works</p>
            <h2 style={{ margin: '6px 0 20px' }}>在恆流，事情是這樣發生的</h2>
            <div className="steps">
              <div className="step">
                <span className="mono step-n">01</span>
                <h3>發現原創</h3>
                <p className="muted">每個計畫都經過原創驗證與實名審核，你看到的都是真的在做的事。</p>
              </div>
              <div className="step">
                <span className="mono step-n">02</span>
                <h3>放心贊助</h3>
                <p className="muted">選擇回饋方案，集資期間隨時可以改變心意，權益寫在每一頁。</p>
              </div>
              <div className="step">
                <span className="mono step-n">03</span>
                <h3>看著它抵達</h3>
                <p className="muted">進度軌道公開每一步，直到作品送到你手上，紀錄永久保留。</p>
              </div>
            </div>
          </section>

          {/* 提案者招募 */}
          <section className="wrap section">
            <div className="cta-panel">
              <div>
                <p className="eyebrow" style={{ color: 'var(--gold-soft)' }}>For Creators</p>
                <h2>有一件想完成的作品嗎？</h2>
                <p style={{ maxWidth: 480, marginTop: 8, opacity: .85 }}>
                  從提案、文案到頁面呈現，我們陪你把想法整理成走得完的計畫。
                  結案之後，作品還能透過恆域藝創走進寄售與拍賣通路。
                </p>
              </div>
              <Link to="/start" className="btn gold">發起你的計畫</Link>
            </div>
          </section>
        </>
      )}
    </>
  )
}

function Section({ eyebrow, title, note, children }) {
  return (
    <section className="wrap section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {note && <p className="small muted">{note}</p>}
      </div>
      {children}
    </section>
  )
}
