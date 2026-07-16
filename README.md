# 恆流 EverFlow

錢跟著進度走的群眾集資平台。分段撥款、資金流向公開、退款一律原路退回。

## 架構

- 前端：Vite + React + React Router（骨白 / 深林綠 / 香檳金，Newsreader + Noto Sans TC）
- 資料庫與登入：Supabase（Magic Link + Google OAuth，RLS 全開）
- 金流：藍新金流 NewebPay MPG（Netlify Functions 處理加密與回調）
- 部署：GitHub → Netlify 自動建置

未設定任何金鑰時，網站以「示範模式」運行：內建三個示範計畫，
搜尋、篩選、專案頁、結帳流程與後台全部可以操作預覽。

## 部署步驟（iPad 可完成）

1. 把本資料夾推上 GitHub，Netlify 選擇該 repo，建置指令與輸出目錄已寫在 `netlify.toml`
2. 建立 Supabase 專案，在 SQL Editor 執行 `supabase/schema.sql`
3. Supabase → Authentication 開啟 Email（Magic Link）與 Google Provider
4. Netlify → Site settings → Environment variables 填入 `.env.example` 列出的所有變數
   - `SUPABASE_SERVICE_ROLE_KEY` 只放這裡，絕不放進前端程式碼
5. 向藍新申請商店，取得 MerchantID / HashKey / HashIV，先用測試環境 `https://ccore.newebpay.com`
6. 重新部署，完成

## 金流測試

藍新測試環境提供測試卡號（見其技術手冊）。付款成功後藍新會呼叫
`/.netlify/functions/newebpay-notify`，驗證檢查碼、解密後把訂單標為 `paid`，
並保存交易序號（`payment_trade_no`），退款時憑此原路退回。

## 資金安全設計（程式層落實）

- 前端 anon key 經 RLS 限制，無法變更任何資金狀態
- 撥款、退款、里程碑核准只能由 service role 在伺服器端執行
- `payout_events` 為只增不改的帳本，計畫頁公開可查
- `pledges` 保留裝置雜湊與 IP 前綴欄位，供贊助圖譜監測（人頭偵測）

## 下一步（尚未包含）

- 提案者建案流程與 AI 審查（法遵條款掃描、原創比對）
- LINE 官方帳號 CRM 串接
- 里程碑證明上傳與審核介面（管理端）
- i18n 英文版
