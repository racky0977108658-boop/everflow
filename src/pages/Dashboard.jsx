import { PROJECTS, fmt, escrowSplit } from '../data/seed.js'
import FundTrack from '../components/FundTrack.jsx'

/**
 * 提案者後台（示範以第一個計畫為例）。
 * 正式模式下改讀取目前登入者擁有的 projects 與 payout_events。
 */
export default function Dashboard() {
  const p = PROJECTS[0]
  const split = escrowSplit(p)
  const net = Math.round(p.raised * 0.95) // 平台費 5% 示意，實際依合約
  const releasedAmt = Math.round(net * (split.released / 100))
  const escrowAmt = net - releasedAmt

  return (
    <div className="wrap" style={{ padding: '48px 0 96px' }}>
      <p className="eyebrow">提案者後台</p>
      <h1 style={{ fontSize: 'clamp(24px,3.5vw,36px)', margin: '8px 0 4px' }}>{p.title}</h1>
      <p className="muted small">撥款帳戶：已完成實名綁定（帳戶末四碼 5217）・變更撥款帳戶需重新驗證</p>

      <div className="dash-grid">
        <div className="stat">
          <span className="eyebrow">累計贊助</span>
          <div className="n">{fmt(p.raised)}</div>
        </div>
        <div className="stat">
          <span className="eyebrow">已撥付</span>
          <div className="n gold">{fmt(releasedAmt)}</div>
        </div>
        <div className="stat">
          <span className="eyebrow">託管中</span>
          <div className="n">{fmt(escrowAmt)}</div>
        </div>
        <div className="stat">
          <span className="eyebrow">贊助人數</span>
          <div className="n">{p.backers.toLocaleString()}</div>
        </div>
      </div>

      <div className="panel">
        <h2>撥款進度</h2>
        <FundTrack released={split.released} escrow={split.escrow} />
        <table className="ledger" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>里程碑</th><th>比例</th><th>狀態</th><th>下一步</th>
            </tr>
          </thead>
          <tbody>
            {p.milestones.map((m) => (
              <tr key={m.seq}>
                <td>{m.seq}. {m.title}</td>
                <td className="mono">{m.pct}%</td>
                <td>{m.status === 'released' ? '已撥付' : m.status === 'escrow' ? '審核中' : '未解鎖'}</td>
                <td className="small muted">
                  {m.status === 'released' && '已完成'}
                  {m.status === 'escrow' && '請補齊進度證明：' + (m.note || '')}
                  {m.status === 'locked' && '前一階段撥付後開放提交'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small muted" style={{ marginTop: 14 }}>
          進度證明需可驗證（如視訊驗機、供應商單據、物流單號）。審核通過後三個工作日內撥付。
        </p>
      </div>

      <div className="panel">
        <h2>異常監測</h2>
        <div className="notice ok">
          本計畫資金來源分佈正常：無同卡多帳號、新帳號集中贊助或截止前異常衝量之訊號。
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          平台對每個計畫執行贊助圖譜監測。偵測到人頭帳號或自買自賣訊號時，撥款將凍結並啟動調查；查證屬實者依服務條款終止計畫、全額原路退款並通報主管機關。
        </p>
      </div>
    </div>
  )
}
