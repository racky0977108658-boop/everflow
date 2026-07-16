import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 未設定 Supabase 時回傳 null，前端自動切換為示範資料模式 */
export const supabase = url && key ? createClient(url, key) : null
export const isLive = Boolean(supabase)
