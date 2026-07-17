/**
 * 示範資料：尚未接上 Supabase 時使用。結構與資料庫 ef_ 表一致。
 * status: published 集資中 / completed 已結案且如期送達
 */

export const CATEGORIES = ['全部', '藝術收藏', '設計', '科技', '出版', '公益']

const M = (a, b, c) => [
  { seq: 1, title: a[0], pct: a[1], status: a[2], note: a[3] || '' },
  { seq: 2, title: b[0], pct: b[1], status: b[2], note: b[3] || '' },
  { seq: 3, title: c[0], pct: c[1], status: c[2], note: c[3] || '' },
]

export const PROJECTS = [
  {
    slug: 'lumen-vessel', title: '曜壺 Lumen Vessel：手工琉璃茶器限量典藏計畫', category: '藝術收藏',
    summary: '與工藝家聯名的 88 件限量琉璃茶器。每件附作者親簽證書與序號，結案後可透過恆域藝創進入寄售與拍賣通路。',
    cover: '曜', goal: 800000, raised: 1264000, backers: 214, days_left: 11, status: 'published',
    verified: ['原創已驗證', '在地製作', '提案者已實名'],
    milestones: M(['開爐與材料採購', 30, 'released', '窯口影像與材料單據已公開'], ['首批 30 件完成品檢', 30, 'escrow', '待第三方檢驗紀錄'], ['全數出貨與序號登錄', 40, 'locked', '物流單號上傳後撥付']),
    tiers: [
      { id: 't1', name: '單件典藏', price: 8800, desc: '琉璃茶器一件、親簽證書、典藏木盒', limit: 88 },
      { id: 't2', name: '雙件對壺', price: 16600, desc: '成對茶器、藏家編號優先選', limit: 20 },
    ],
    story: '這個計畫想把台灣工藝的火光留在日常裡。每一件曜壺都由工藝家親手吹製，入窯到出窯需時十四天，成品率不到四成。我們選擇分段撥款：在您看見品檢紀錄之前，大部分款項仍安放在託管專戶。',
  },
  {
    slug: 'echo-ring', title: '迴聲 Echo Ring：離線語音備忘的智慧戒指', category: '科技',
    summary: '長按即錄、離線轉文字、七天續航。台灣團隊軟硬整合，資料不出裝置。',
    cover: '迴', goal: 1200000, raised: 2183000, backers: 903, days_left: 17, status: 'published',
    verified: ['原創已驗證', '提案者已實名'],
    milestones: M(['工程打樣與驗證', 30, 'released', '打樣視訊驗機紀錄已公開'], ['量產與 NCC 認證', 30, 'escrow'], ['全數出貨', 40, 'locked']),
    tiers: [
      { id: 't1', name: '早鳥單只', price: 3690, desc: 'Echo Ring 本體、充電座、三種戒圍可選', limit: 800 },
      { id: 't2', name: '雙人成行', price: 6980, desc: '兩只本體、加贈旅行收納盒', limit: 300 },
    ],
    story: '好點子總是在最不方便拿手機的時候出現。我們花了兩年，把錄音、轉寫、加密全部塞進一枚戒指，並且讓資料留在你手上，不上雲端。',
  },
  {
    slug: 'formosa-blue', title: '福爾摩沙藍：三位染師的靛染帆布聯名系列', category: '藝術收藏',
    summary: '三峽藍染、天然靛泥、手工縫製。托特包與筆袋兩型，每件染紋獨一無二。',
    cover: '藍', goal: 450000, raised: 512000, backers: 288, days_left: 8, status: 'published',
    verified: ['原創已驗證', '在地製作', '提案者已實名'],
    milestones: M(['靛泥備料與染布', 40, 'released', '染坊工作紀錄已公開'], ['縫製與整理', 30, 'escrow'], ['出貨完成', 30, 'locked']),
    tiers: [
      { id: 't1', name: '靛染筆袋', price: 1280, desc: '手染帆布筆袋一件', limit: null },
      { id: 't2', name: '典藏托特', price: 2880, desc: '大容量托特包、附染師簽名布標', limit: 150 },
    ],
    story: '藍染的美是等出來的。布要下缸氧化十二次，顏色才會沉到布的骨子裡。這次三位染師各染一缸，你收到的每一件，紋路都只此一件。',
  },
  {
    slug: 'atlas-frame', title: 'Atlas Frame：模組化航太鋁登山相框背板', category: '設計',
    summary: '為戶外攝影者設計的極輕量展示系統。CNC 切削、可壁掛可立式，台中精機廠生產。',
    cover: 'A', goal: 500000, raised: 387000, backers: 156, days_left: 23, status: 'published',
    verified: ['原創已驗證', '提案者已實名'],
    milestones: M(['開模與打樣驗證', 30, 'escrow', '打樣視訊驗機後撥付'], ['量產與陽極處理', 30, 'locked'], ['出貨完成', 40, 'locked']),
    tiers: [
      { id: 't1', name: '早鳥單組', price: 1680, desc: 'Atlas Frame 本體與壁掛套件', limit: 300 },
      { id: 't2', name: '雙組合購', price: 2980, desc: '兩組本體、加贈立架', limit: 150 },
    ],
    story: '我們是兩位機構工程師，做了十一次打樣。上恆流的原因很簡單：讓贊助者看得到進度，我們也拿階段目標當作自己的紀律。',
  },
  {
    slug: 'moss-atlas', title: '苔境 Moss Atlas：免澆水的桌上苔蘚生態瓶', category: '設計',
    summary: '封閉式生態循環，一年免澆水。附培育手冊與備用苔盒，陽明山苗圃培育。',
    cover: '苔', goal: 200000, raised: 156000, backers: 402, days_left: 19, status: 'published',
    verified: ['原創已驗證', '在地製作'],
    milestones: M(['苔蘚培育與備料', 30, 'escrow'], ['組瓶與養護觀察', 30, 'locked'], ['出貨完成', 40, 'locked']),
    tiers: [
      { id: 't1', name: '單瓶入門', price: 980, desc: '生態瓶一件、培育手冊', limit: null },
      { id: 't2', name: '雙瓶對景', price: 1780, desc: '兩件成對、附備用苔盒', limit: 200 },
    ],
    story: '苔蘚是最安靜的植物，也是最誠實的：環境對了它就綠給你看。我們想把一小片山，放進你的桌上。',
  },
  {
    slug: 'paper-theatre', title: '紙上劇場：立體書版的台灣廟埕故事', category: '出版',
    summary: '六幕手工立體場景，收錄布袋戲、歌仔戲與夜市光景。紙藝家與繪本作者聯手三年之作。',
    cover: '紙', goal: 300000, raised: 189000, backers: 233, days_left: 26, status: 'published',
    verified: ['原創已驗證', '提案者已實名'],
    milestones: M(['編輯與紙藝定稿', 40, 'escrow'], ['印刷與手工組裝', 30, 'locked'], ['出貨完成', 30, 'locked']),
    tiers: [
      { id: 't1', name: '立體書一冊', price: 1580, desc: '精裝立體書、導讀別冊', limit: null },
      { id: 't2', name: '珍藏簽名版', price: 2380, desc: '作者雙簽名、限量藏書票', limit: 100 },
    ],
    story: '廟埕是台灣最早的劇場。我們想讓這些聲音和光，在你翻開書頁的那一刻重新站起來。',
  },
  {
    slug: 'inkbound', title: '墨向 Inkbound：台灣新銳版畫年鑑 2026 出版計畫', category: '出版',
    summary: '收錄 42 位新銳版畫家的年度選集，附兩張原寸復刻版畫。與三間獨立書店聯合首發。',
    cover: '墨', goal: 350000, raised: 402500, backers: 511, days_left: 4, status: 'published',
    verified: ['原創已驗證', '在地製作', '提案者已實名'],
    milestones: M(['編務與授權完成', 40, 'released', '授權清冊已公開'], ['印刷與裝幀', 30, 'escrow'], ['出貨與書店鋪貨', 30, 'locked']),
    tiers: [
      { id: 't1', name: '年鑑一冊', price: 1280, desc: '精裝年鑑、復刻版畫兩張', limit: null },
      { id: 't2', name: '藏家套組', price: 3600, desc: '年鑑、限量絹印海報、聯展導覽', limit: 60 },
    ],
    story: '版畫的美在於複數性：同一塊版，能走進很多人的家裡。這本年鑑想成為新銳創作者被看見的那塊版。',
  },
  {
    slug: 'guide-dog-homes', title: '導盲犬寄養家庭支持計畫：陪牠走完成為夥伴前的一年', category: '公益',
    summary: '支持 20 個寄養家庭的飼育物資、獸醫與訓練課程。執行單位定期公開報告。',
    cover: '犬', goal: 600000, raised: 431000, backers: 1204, days_left: 31, status: 'published',
    verified: ['勸募字號已揭露', '提案者已實名'],
    milestones: M(['啟動與家庭媒合', 40, 'released', '媒合名單與物資清冊已公開'], ['期中執行報告', 30, 'escrow'], ['結案報告公開', 30, 'locked']),
    tiers: [
      { id: 't1', name: '一個月的飼料', price: 500, desc: '支持一個寄養家庭一個月的基本物資', limit: null },
      { id: 't2', name: '一堂訓練課', price: 1500, desc: '支持一堂社會化訓練課程、附季度報告', limit: null },
    ],
    story: '每一隻導盲犬成為夥伴之前，都有一個普通家庭陪牠學會這個世界。我們想讓這些家庭不必獨自承擔。',
  },
  {
    slug: 'street-organ', title: '街聲不息：老音樂箱修復與巡迴計畫', category: '公益',
    summary: '修復三座手搖音樂箱，帶著街頭藝人走進十二個鄉鎮的市集與長照據點。',
    cover: '聲', goal: 250000, raised: 97000, backers: 186, days_left: 38, status: 'published',
    verified: ['提案者已實名'],
    milestones: M(['音樂箱修復', 40, 'escrow'], ['巡迴前六站', 30, 'locked'], ['巡迴後六站與紀錄片', 30, 'locked']),
    tiers: [
      { id: 't1', name: '一格琴片', price: 350, desc: '支持修復、名字刻於巡迴感謝冊', limit: null },
      { id: 't2', name: '一場演出', price: 2000, desc: '指定一站演出的共同支持者、附紀錄片連結', limit: 12 },
    ],
    story: '音樂箱轉起來的時候，整條街都會慢下來。我們想讓這個聲音再走十二個地方。',
  },
  {
    slug: 'kiln-plates', title: '窯燒日常：柴燒餐瓷六件組', category: '藝術收藏',
    summary: '苗栗柴窯三日三夜燒成，灰釉自然落灰，每組色澤獨一。已於 2026 年 5 月全數送達。',
    cover: '窯', goal: 400000, raised: 683000, backers: 351, days_left: 0, status: 'completed',
    verified: ['原創已驗證', '在地製作', '如期送達'],
    milestones: M(['備土與排窯', 30, 'released'], ['燒成與揀選', 30, 'released'], ['全數出貨', 40, 'released', '2026 年 5 月全數送達']),
    tiers: [
      { id: 't1', name: '六件組', price: 3200, desc: '柴燒餐瓷六件、桐木盒', limit: 400 },
      { id: 't2', name: '雙人宴席組', price: 5800, desc: '十二件、附窯記證書', limit: 120 },
    ],
    story: '柴燒沒有兩件一樣的作品，火痕與落灰是窯自己的簽名。這個計畫從備土到送達走了五個月，每一步的紀錄都留在頁面上。',
  },
  {
    slug: 'ridgeline-stove', title: '稜線 Ridgeline：鈦合金摺疊登山爐', category: '設計',
    summary: '112 克、名片大小、三分鐘展開。已於 2026 年 3 月如期送達全數贊助者。',
    cover: '稜', goal: 600000, raised: 1421000, backers: 987, days_left: 0, status: 'completed',
    verified: ['原創已驗證', '如期送達'],
    milestones: M(['打樣與風洞測試', 30, 'released'], ['量產與品檢', 30, 'released'], ['全數出貨', 40, 'released', '2026 年 3 月如期送達']),
    tiers: [
      { id: 't1', name: '單爐', price: 1880, desc: '爐體、收納袋', limit: 1000 },
      { id: 't2', name: '縱走組', price: 3280, desc: '爐體、擋風板、鈦杯', limit: 400 },
    ],
    story: '在稜線上，每一克都要有理由。這座爐的理由是：讓你在任何地方，都煮得了一碗熱的。',
  },
  {
    slug: 'zine-press', title: '自印時代：Risograph 小誌共用工作站', category: '出版',
    summary: '在台南成立開放使用的孔版印刷工作站，首年支持 60 本獨立小誌誕生。已如期啟用。',
    cover: '印', goal: 500000, raised: 552000, backers: 468, days_left: 0, status: 'completed',
    verified: ['提案者已實名', '如期送達'],
    milestones: M(['設備採購與空間整備', 40, 'released'], ['工作站啟用', 30, 'released'], ['首年營運報告', 30, 'released', '報告已公開於計畫頁']),
    tiers: [
      { id: 't1', name: '創站會員', price: 800, desc: '首年八小時使用時數', limit: 200 },
      { id: 't2', name: '小誌套組', price: 1500, desc: '首年誕生的三本精選小誌', limit: 150 },
    ],
    story: '印刷曾經是門檻，我們想讓它變成鄰居。工作站已經啟用，這一頁留著，作為走完全程的紀錄。',
  },
]

export const fmt = (n) => 'NT$ ' + Number(n).toLocaleString('zh-Hant-TW')

export function escrowSplit(p) {
  const ms = p.milestones ?? []
  const released = ms.filter((m) => m.status === 'released').reduce((s, m) => s + m.pct, 0)
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
