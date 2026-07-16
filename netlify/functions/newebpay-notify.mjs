/**
 * 藍新金流付款結果回調（NotifyURL）
 * 驗證 TradeSha → 解密 TradeInfo → 更新 Supabase pledges 狀態
 *
 * 額外環境變數：
 *  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（service key 只放在伺服器端）
 */
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const { NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) return new Response('not configured', { status: 503 })

  const form = new URLSearchParams(await req.text())
  const tradeInfo = form.get('TradeInfo')
  const tradeSha = form.get('TradeSha')
  if (!tradeInfo || !tradeSha) return new Response('bad request', { status: 400 })

  // 1. 驗證檢查碼，防止偽造回調
  const expect = crypto
    .createHash('sha256')
    .update(`HashKey=${NEWEBPAY_HASH_KEY}&${tradeInfo}&HashIV=${NEWEBPAY_HASH_IV}`)
    .digest('hex')
    .toUpperCase()
  if (expect !== tradeSha) return new Response('checksum mismatch', { status: 400 })

  // 2. 解密交易內容
  const decipher = crypto.createDecipheriv('aes-256-cbc', NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV)
  decipher.setAutoPadding(false)
  let plain = decipher.update(tradeInfo, 'hex', 'utf8') + decipher.final('utf8')
  plain = plain.replace(/[\x00-\x20]+$/g, '') // 去除 padding

  let payload
  try { payload = JSON.parse(plain) } catch { return new Response('bad payload', { status: 400 }) }

  const ok = payload.Status === 'SUCCESS'
  const result = payload.Result || {}
  const pledgeId = result.OrderComment || null
  const orderNo = result.MerchantOrderNo

  // 3. 更新訂單（原路退回所需的交易序號一併保存）
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && pledgeId) {
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    await db
      .from('pledges')
      .update({
        status: ok ? 'paid' : 'failed',
        payment_order_no: orderNo,
        payment_trade_no: result.TradeNo || null,
        payment_type: result.PaymentType || null,
        paid_at: ok ? new Date().toISOString() : null,
      })
      .eq('id', pledgeId)
      .eq('status', 'pending') // 冪等：只允許 pending → paid/failed
  }

  // 藍新要求回應 200 表示已收到
  return new Response('OK', { status: 200 })
}
