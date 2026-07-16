/**
 * 藍新金流 NewebPay 幕前支付（MPG）建立交易
 * 文件：https://www.newebpay.com 技術串接手冊 MPG 1.6+
 *
 * 流程：前端 POST { pledgeId, amount, email, itemDesc }
 *  1. 組 TradeInfo 參數字串
 *  2. AES-256-CBC 以 HashKey/HashIV 加密 → TradeInfo
 *  3. SHA256(HashKey + TradeInfo + HashIV) 大寫 → TradeSha
 *  4. 回傳自動送出的 <form>，導向藍新付款頁
 *
 * 環境變數（設定於 Netlify）：
 *  NEWEBPAY_MERCHANT_ID / NEWEBPAY_HASH_KEY / NEWEBPAY_HASH_IV
 *  NEWEBPAY_GATEWAY（測試 https://ccore.newebpay.com，正式 https://core.newebpay.com）
 *  SITE_URL（用於 ReturnURL / NotifyURL）
 */
import crypto from 'node:crypto'

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405 })
  }

  const { NEWEBPAY_MERCHANT_ID, NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV, NEWEBPAY_GATEWAY, SITE_URL } = process.env
  if (!NEWEBPAY_MERCHANT_ID || !NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
    return new Response(JSON.stringify({ error: 'gateway not configured' }), { status: 503 })
  }

  let body
  try { body = await req.json() } catch { return new Response(JSON.stringify({ error: 'bad json' }), { status: 400 }) }

  const amount = Math.round(Number(body.amount))
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_500_000) {
    return new Response(JSON.stringify({ error: 'bad amount' }), { status: 400 })
  }
  const email = String(body.email || '').slice(0, 100)
  const itemDesc = String(body.itemDesc || '恆流集資贊助').slice(0, 50)
  const orderNo = ('EF' + Date.now() + Math.random().toString(36).slice(2, 6)).slice(0, 30)

  const params = new URLSearchParams({
    MerchantID: NEWEBPAY_MERCHANT_ID,
    RespondType: 'JSON',
    TimeStamp: String(Math.floor(Date.now() / 1000)),
    Version: '2.0',
    MerchantOrderNo: orderNo,
    Amt: String(amount),
    ItemDesc: itemDesc,
    Email: email,
    LoginType: '0',
    CREDIT: '1',
    VACC: '1', // ATM 虛擬帳號
    ReturnURL: `${SITE_URL}/`,
    NotifyURL: `${SITE_URL}/.netlify/functions/newebpay-notify`,
    // 自訂欄位：帶回 pledgeId 以便回調時對帳
    OrderComment: String(body.pledgeId || '').slice(0, 30),
  }).toString()

  // AES-256-CBC 加密
  const cipher = crypto.createCipheriv('aes-256-cbc', NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV)
  const tradeInfo = cipher.update(params, 'utf8', 'hex') + cipher.final('hex')

  // SHA256 檢查碼
  const tradeSha = crypto
    .createHash('sha256')
    .update(`HashKey=${NEWEBPAY_HASH_KEY}&${tradeInfo}&HashIV=${NEWEBPAY_HASH_IV}`)
    .digest('hex')
    .toUpperCase()

  const gateway = NEWEBPAY_GATEWAY || 'https://ccore.newebpay.com'
  const esc = (s) => String(s).replace(/"/g, '&quot;')
  const html = `<!doctype html><html lang="zh-Hant-TW"><body>
    <p style="font-family:sans-serif">正在前往藍新金流安全付款頁…</p>
    <form id="pay" method="post" action="${gateway}/MPG/mpg_gateway">
      <input type="hidden" name="MerchantID" value="${esc(NEWEBPAY_MERCHANT_ID)}">
      <input type="hidden" name="TradeInfo" value="${esc(tradeInfo)}">
      <input type="hidden" name="TradeSha" value="${esc(tradeSha)}">
      <input type="hidden" name="Version" value="2.0">
    </form>
    <script>document.getElementById('pay').submit()</script>
  </body></html>`

  return new Response(JSON.stringify({ html, orderNo }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
