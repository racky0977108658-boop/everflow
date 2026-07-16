/**
 * 示範資料：尚未接上 Supabase 時使用。
 * 結構與 supabase/schema.sql 一致，之後可直接匯入。
 */

export const CATEGORIES = ['全部', '藝術收藏', '設計', '科技', '出版', '公益']

export const PROJECTS = [
  {
    slug: 'lumen-vessel',
    title: '曜壺 Lumen Vessel：手工琉璃茶器限量典藏計畫',
    category: '藝術收藏',
    summary:
      '與工藝家聯名的 88 件限量琉璃茶器。每件附作者親簽證書與序號，結案後可透過恆域藝創進入寄售與拍賣通路。',
    cover: '曜',
    goal: 800000,
    raised: 1264000,
    backers: 214,
    days_left: 11,
    verified: ['原創已驗證', '在地製作', '提案者已實名'],
    milestones: [
      { seq: 1, title: '開爐與材料採購', pct: 30, status: 'released', note: '窯口影像與材料單據已公開' },
      { seq: 2, title: '首批 30 件完成品檢', pct: 30, status: 'escrow', note: '待第三方檢驗紀錄' },
      { seq: 3, title: '全數出貨與序號登錄', pct: 40, status: 'locked', note: '物流單號上傳後撥付' },
    ],
    tiers: [
      { id: 't1', name: '單件典藏', price: 8800, desc: '琉璃茶器一件、親簽證書、典藏木盒', limit: 88 },
      { id: 't2', name: '雙件對壺', price: 16600, desc: '成對茶器、藏家編號優先選', limit: 20 },
    ],
    story:
      '這個計畫想把台灣工藝的火光留在日常裡。每一件曜壺都由工藝家親手吹製，入窯到出窯需時十四天，成品率不到四成。我們選擇分段撥款：在您看見品檢紀錄之前，大部分款項仍安放在託管專戶。',
  },
  {
    slug: 'atlas-frame',
    title: 'Atlas Frame：模組化航太鋁登山相框背板',
    category: '設計',
    summary:
      '為戶外攝影者設計的極輕量展示系統。CNC 切削、可壁掛可立式，台中精機廠生產。',
    cover: 'A',
    goal: 500000,
    raised: 387000,
    backers: 156,
    days_left: 23,
    verified: ['原創已驗證', '提案者已實名'],
    milestones: [
      { seq: 1, title: '開模與打樣驗證', pct: 30, status: 'escrow', note: '打樣視訊驗機後撥付' },
      { seq: 2, title: '量產與陽極處理', pct: 30, status: 'locked', note: '' },
      { seq: 3, title: '出貨完成', pct: 40, status: 'locked', note: '' },
    ],
    tiers: [
      { id: 't1', name: '早鳥單組', price: 1680, desc: 'Atlas Frame 本體與壁掛套件', limit: 300 },
      { id: 't2', name: '雙組合購', price: 2980, desc: '兩組本體、加贈立架', limit: 150 },
    ],
    story:
      '我們是兩位機構工程師，做了十一次打樣。上恆流的原因很簡單：讓贊助者看得到錢在哪裡，我們也拿階段撥款當作自己的進度紀律。',
  },
  {
    slug: 'inkbound',
    title: '墨向 Inkbound：台灣新銳版畫年鑑 2026 出版計畫',
    category: '出版',
    summary:
      '收錄 42 位新銳版畫家的年度選集，附兩張原寸復刻版畫。與三間獨立書店聯合首發。',
    cover: '墨',
    goal: 350000,
    raised: 402500,
    backers: 511,
    days_left: 4,
    verified: ['原創已驗證', '在地製作', '提案者已實名'],
    milestones: [
      { seq: 1, title: '編務與授權完成', pct: 40, status: 'released', note: '授權清冊已公開' },
      { seq: 2, title: '印刷與裝幀', pct: 30, status: 'escrow', note: '' },
      { seq: 3, title: '出貨與書店鋪貨', pct: 30, status: 'locked', note: '' },
    ],
    tiers: [
      { id: 't1', name: '年鑑一冊', price: 1280, desc: '精裝年鑑、復刻版畫兩張', limit: null },
      { id: 't2', name: '藏家套組', price: 3600, desc: '年鑑、限量絹印海報、聯展導覽', limit: 60 },
    ],
    story:
      '版畫的美在於複數性：同一塊版，能走進很多人的家裡。這本年鑑想成為新銳創作者被看見的那塊版。',
  },
]

export const fmt = (n) => 'NT$ ' + Number(n).toLocaleString('zh-Hant-TW')

export function escrowSplit(p) {
  const released = p.milestones.filter((m) => m.status === 'released').reduce((s, m) => s + m.pct, 0)
  return { released, escrow: 100 - released }
}

/** 將資料庫欄位正規化為前端使用的形狀 */
export function normalizeRow(row) {
  return {
    ...row,
    milestones: [...(row.milestones ?? [])].sort((a, b) => a.seq - b.seq),
    tiers: [...(row.tiers ?? [])]
      .sort((a, b) => a.price - b.price)
      .map((t) => ({ ...t, desc: t.desc ?? t.descr, limit: t.limit ?? t.limit_qty })),
    verified: row.verified ?? [],
  }
}
