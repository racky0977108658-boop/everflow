import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { PROJECTS, fmt } from '../data/seed.js'
import { supabase, isLive } from '../lib/supabase.js'

export default function Checkout() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const p = PROJECTS.find((x) => x.slug === slug)
  const [tierId, setTierId] = useState(params.get('tier') || p?.tiers[0]?.id)
  const [qty, setQty] = useState(1)
  const [email, setEmail] = useState('')
  const [agreeRisk, setAgreeRisk] = useState(false)
  const [agreeLaw, setAgreeLaw] = useState(false)
  const [state, setState] = useState({ busy: false, msg: null, err: null })

  const tier = useMemo(() => p?.tiers.find((t) => t.id === tierId), [p, tierId])
  const total = (tier?.price ?? 0) * qty

  if (!p) return <div className="wrap" style={{ padding: '80px 0' }}><h2>找不到這個計畫</h2></div>

  async function pay() {
    if (!agreeRisk || !agreeLaw) {
      setState({ busy: false, err: '請先閱讀並勾選風險告知與法定權益說明。', msg: null })
      return
    }
    if (!email.includes('@')) {
      setState({ busy: false, err: '請填寫有效的電子信箱，付款與退款通知都會寄到這裡。', msg: null })
      return
    }
    setState({ busy: true, err: null, msg: null })
    try {
      /** 建立訂單（正式模式寫入 Supabase，之後由金流回調更新狀態） */
      const pledgeId = crypto.randomUUID()
      if (isLive) {
        const { error } = await supabase
          .from('ef_pledges')
          .insert({ id: pledgeId, project_slug: slug, tier_id: tierId, qty, amount: total, email, status: 'pending' })
        if (error) throw error
      }

      /** 呼叫藍新金流建立交易，成功會回傳自動送出的付款表單 */
      const res = await fetch('/.netlify/functions/newebpay-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pledgeId, amount: total, email, itemDesc: `${p.title}：${tier.name} x${qty}` }),
      })
      if (!res.ok) throw new Error('gateway')
      const { html } = await res.json()
      document.open(); document.write(html); document.close()
    } catch {
      setState({
        busy: false, msg: null,
        err: isLive
          ? '付款服務暫時無法使用，請稍後再試。您的贊助尚未成立，不會被扣款。'
          : '示範模式：尚未設定金流金鑰。部署後於 Netlify 環境變數填入藍新 MerchantID、HashKey、HashIV 即可啟用付款。',
      })
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 720, padding: '48px 0 80px' }}>
      <p className="eyebrow">贊助</p>
      <h1 style={{ fontSize: 'clamp(24px,3.5vw,34px)', margin: '8px 0 24px' }}>{p.title}</h1>

      <div className="panel">
        <h2>選擇回饋方案</h2>
        {p.tiers.map((t) => (
          <button
            key={t.id}
            className={'tier' + (t.id === tierId ? ' on' : '')}
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
            onClick={() => setTierId(t.id)}
          >
            <div className="price mono">{fmt(t.price)}</div>
            <div className="name">{t.name}</div>
            <div className="small muted">{t.desc}</div>
          </button>
        ))}

        <div className="field" style={{ marginTop: 20 }}>
          <label htmlFor="qty">數量{tier?.limit ? `（此方案限量 ${tier.limit} 份）` : ''}</label>
          <div className="qty-row">
            <button type="button" className="qty-btn" aria-label="減少數量"
              onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
            <input
              id="qty" type="number" inputMode="numeric" min="1" max={tier?.limit ?? 999}
              value={qty}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                setQty(Number.isFinite(n) ? Math.min(Math.max(1, n), tier?.limit ?? 999) : 1)
              }}
            />
            <button type="button" className="qty-btn" aria-label="增加數量"
              onClick={() => setQty((n) => Math.min(n + 1, tier?.limit ?? 999))}>＋</button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">電子信箱（付款與退款通知）</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="law-box" style={{ margin: '18px 0' }}>
          <span><b>託管說明</b>：您的款項將存放於第三方託管專戶，依計畫頁公開的里程碑分段撥付給提案者。集資期間您可隨時取消贊助，全額沿原付款方式退回。</span>
          <span><b>法定權益</b>：本交易為通訊交易，依消費者保護法第 19 條，您於收受商品後七日內得不附理由退回商品、解除契約；退款於收到退回商品之次日起十五日內沿原付款路徑返還。</span>
        </div>

        <label className="checkline">
          <input type="checkbox" checked={agreeRisk} onChange={(e) => setAgreeRisk(e.target.checked)} />
          我已閱讀本計畫的「風險與承諾」，理解群眾集資屬預購性質，交付時間可能變動。
        </label>
        <label className="checkline">
          <input type="checkbox" checked={agreeLaw} onChange={(e) => setAgreeLaw(e.target.checked)} />
          我已收到並理解上述七日猶豫期與退款方式之書面告知。
        </label>

        {state.err && <div className="notice err" style={{ margin: '14px 0' }}>{state.err}</div>}
        {state.msg && <div className="notice ok" style={{ margin: '14px 0' }}>{state.msg}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
          <div>
            <span className="small muted">應付總額</span>
            <div className="mono" style={{ fontSize: 24 }}>{fmt(total)}</div>
          </div>
          <button className="btn gold" onClick={pay} disabled={state.busy}>
            {state.busy ? '前往付款中' : '前往安全付款'}
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 14 }}>
          付款由藍新金流 NewebPay 處理，本平台不經手也不儲存您的卡號。
        </p>
      </div>

      <p style={{ marginTop: 18 }}>
        <Link to={`/project/${slug}`} className="muted small">← 返回計畫頁</Link>
      </p>
    </div>
  )
}
