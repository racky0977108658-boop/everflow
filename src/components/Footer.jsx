import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap cols">
        <div>
          <div className="brand" style={{ fontSize: 18 }}>恆流 <em>EverFlow</em></div>
          <p style={{ marginTop: 8, maxWidth: 340 }}>
            錢跟著進度走的群眾集資平台。出貨之前，款項仍在第三方託管專戶，依里程碑分段撥付。
          </p>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <Link to="/legal">贊助者保障規則</Link>
          <Link to="/legal">服務條款與隱私權</Link>
          <a href="mailto:hello@everflow.tw">聯絡我們</a>
        </div>
        <div className="small">
          © {new Date().getFullYear()} 恆域藝創有限公司 Everfield Artico Co., Ltd.
          <br />依消費者保護法第 19 條，通訊交易享七日猶豫期。
        </div>
      </div>
    </footer>
  )
}
