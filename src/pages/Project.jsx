import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import FundTrack from '../components/FundTrack.jsx'
import { supabase, isLive } from '../lib/supabase.js'
import { PROJECTS, fmt, escrowSplit, normalizeRow } from '../data/seed.js'

const STATUS_LABEL = {
  released: '已撥付',
  escrow: '託管中',
  locked: '未解鎖',
}

export default function Project() {
  const { slug } = useParams()
  const [p, setP] = useState(() => PROJECTS.find((x) => x.slug === slug) ?? null)

  useEffect(() => {
    if (!isLive) return
    supabase
      .from('ef_projects')
      .select('*, milestones:ef_milestones(*), tiers:ef_tiers(*)')
      .eq('slug', slug)
      .single()
      .then(({ data }) => data && setP(normalizeRow(data)))
  }, [slug])

  if (!p) {
    return (
      <div className="wrap" style={{ padding: '80px 0' }}>
        <h2>找不到這個計畫</h2>
        <p className="muted" style={{ margin: '12px 0 24px' }}>
          它可能已下架，或網址有誤。
        </p>
        <Link className="btn" to="/">回到探索頁</Link>
      </div>
    )
  }

  const split = escrowSplit(p)
  const pctOfGoal = Math.round((p.raised / p.goal) * 100)

  return (
    <>
      <div className="project-head wrap rise">
        <p className="eyebrow">{p.category}</p>
        <h1>{p.title}</h1>
        <div className="verify">
          {p.verified.map((v) => (
            <span key={v} className={'badge' + (v === '原創已驗證' ? ' gold' : '')}>{v}</span>
          ))}
        </div>
      </div>

      <div className="project-layout wrap">
        {/* 左欄：故事與資金流 */}
        <div>
          <div className="panel">
            <h2>計畫故事</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{p.story}</p>
          </div>

          <div className="panel">
            <h2>資金流軌道</h2>
            <p className="muted small" style={{ marginBottom: 16 }}>
              達標款項扣除費用後全數進入第三方託管專戶，依下列里程碑分段撥付。
              每一段撥付都需提案者提交可驗證的進度證明。
            </p>
            <FundTrack released={split.released} escrow={split.escrow} />
            <div className="milestones" style={{ marginTop: 20 }}>
              {p.milestones.map((m) => (
                <div key={m.seq} className={'ms ' + m.status}>
                  <span className="dot" aria-hidden="true" />
                  <div>
                    <div><b>{m.title}</b>　<span className="pct">{m.pct}%</span></div>
                    {m.note && <div className="small muted">{m.note}</div>}
                  </div>
                  <span className="status">{STATUS_LABEL[m.status]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>風險與承諾</h2>
            <div className="law-box">
              <span>本計畫屬預購型群眾集資，量產與交付存在延遲風險，提案者已承諾定期於本頁揭露進度。</span>
              <span>依消費者保護法第 19 條，您收到商品後享有七日猶豫期，得不附理由退回商品並解除契約。</span>
              <span>計畫若逾承諾出貨日六個月仍未出貨且未提出可驗證進度，平台將啟動託管款項退款程序，退款一律沿原付款路徑退回。</span>
            </div>
          </div>
        </div>

        {/* 右欄：贊助 */}
        <aside>
          <div className="panel">
            <div className="mono" style={{ fontSize: 26 }}>{fmt(p.raised)}</div>
            <div className="small muted" style={{ margin: '6px 0 14px' }}>
              目標 {fmt(p.goal)}・{pctOfGoal}% 達成・{p.backers} 人贊助・剩 {p.days_left} 天
            </div>
            <FundTrack released={split.released} escrow={split.escrow} compact />
            <div style={{ marginTop: 18 }}>
              {p.tiers.map((t) => (
                <Link key={t.id} to={`/project/${p.slug}/back?tier=${t.id}`} className="tier" style={{ display: 'block' }}>
                  <div className="price mono">{fmt(t.price)}</div>
                  <div className="name">{t.name}</div>
                  <div className="small muted">{t.desc}</div>
                  {t.limit && <div className="small" style={{ marginTop: 6 }}>限量 {t.limit} 份</div>}
                </Link>
              ))}
            </div>
            {p.status === 'completed' ? (
              <div className="notice ok" style={{ marginTop: 18 }}>
                本計畫已走完全程並如期送達，頁面與進度紀錄永久公開。
              </div>
            ) : (
              <>
                <Link to={`/project/${p.slug}/back`} className="btn gold block" style={{ marginTop: 18 }}>
                  贊助這個計畫
                </Link>
                <p className="small muted" style={{ marginTop: 12 }}>
                  集資期間可隨時取消贊助，全額原路退回。
                </p>
              </>
            )}
          </div>
        </aside>
      </div>

      {p.status !== 'completed' && (
        <div className="mobile-cta">
          <div>
            <span className="small muted">已募得</span>
            <div className="amt">{fmt(p.raised)}</div>
          </div>
          <Link to={`/project/${p.slug}/back`} className="btn gold">贊助這個計畫</Link>
        </div>
      )}
    </>
  )
}
