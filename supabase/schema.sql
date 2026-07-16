-- ============================================================
-- 恆流 EverFlow 資料庫結構（Supabase / Postgres）
-- 於 Supabase SQL Editor 一次執行即可
-- ============================================================

-- 使用者檔案（承接 auth.users）
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role text not null default 'backer' check (role in ('backer','proposer','admin')),
  -- 實名驗證層級：0 未驗證 / 1 個人實名 / 2 法人驗證
  kyc_level int not null default 0,
  payout_bank_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 集資計畫
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner uuid not null references profiles(id),
  title text not null,
  summary text not null,
  story text,
  category text not null,
  cover text,
  goal int not null check (goal > 0),
  raised int not null default 0,
  backers int not null default 0,
  days_left int,
  verified text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft','review','published','funded','terminated','completed')),
  -- 首案額度控管（反詐欺：新提案者上限較低）
  funding_cap int,
  created_at timestamptz not null default now()
);

-- 里程碑（分段撥款的核心）
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  seq int not null,
  title text not null,
  pct int not null check (pct between 1 and 100),
  status text not null default 'locked'
    check (status in ('locked','escrow','submitted','released','rejected')),
  note text,
  evidence_url text,
  released_at timestamptz,
  unique (project_id, seq)
);

-- 回饋方案
create table if not exists tiers (
  id text not null,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  price int not null check (price > 0),
  descr text,
  limit_qty int,
  primary key (project_id, id)
);

-- 贊助訂單
create table if not exists pledges (
  id uuid primary key default gen_random_uuid(),
  project_slug text not null,
  tier_id text,
  backer uuid references profiles(id),
  email text not null,
  qty int not null default 1 check (qty > 0),
  amount int not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending','paid','cancelled','refunded','failed')),
  -- 原路退回所需的金流序號
  payment_order_no text,
  payment_trade_no text,
  payment_type text,
  paid_at timestamptz,
  refunded_at timestamptz,
  -- 反詐欺訊號欄位（由邊緣函式寫入）
  device_hash text,
  ip_prefix text,
  created_at timestamptz not null default now()
);

-- 撥款與退款事件帳本（不可修改，只能新增）
create table if not exists payout_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  milestone_id uuid references milestones(id),
  kind text not null check (kind in ('release','refund','freeze','unfreeze')),
  amount int not null,
  memo text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- 搜尋索引（中文以 trigram 近似比對）
create extension if not exists pg_trgm;
create index if not exists idx_projects_title_trgm on projects using gin (title gin_trgm_ops);
create index if not exists idx_projects_summary_trgm on projects using gin (summary gin_trgm_ops);
create index if not exists idx_projects_status on projects (status, category);
create index if not exists idx_pledges_fraud on pledges (project_slug, device_hash, ip_prefix);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table tiers enable row level security;
alter table pledges enable row level security;
alter table payout_events enable row level security;

-- profiles：本人可讀寫自己
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- projects：已發佈全公開；提案者管理自己的計畫
create policy "public read published" on projects
  for select using (status in ('published','funded','completed') or owner = auth.uid());
create policy "owner insert" on projects for insert with check (owner = auth.uid());
create policy "owner update draft" on projects
  for update using (owner = auth.uid() and status in ('draft','review'));

-- milestones / tiers：隨計畫可見；里程碑狀態只能由服務端（service role）變更
create policy "read with project" on milestones for select using (
  exists (select 1 from projects p where p.id = project_id
          and (p.status in ('published','funded','completed') or p.owner = auth.uid()))
);
create policy "read tiers with project" on tiers for select using (
  exists (select 1 from projects p where p.id = project_id
          and (p.status in ('published','funded','completed') or p.owner = auth.uid()))
);

-- pledges：贊助者本人可讀自己的訂單；寫入僅限本人建立 pending
create policy "own pledges read" on pledges for select using (backer = auth.uid());
create policy "create pending pledge" on pledges
  for insert with check (status = 'pending');

-- payout_events：計畫頁公開透明
create policy "public read payouts" on payout_events for select using (true);

-- 提醒：撥款、退款、里程碑核准一律走 service role（Netlify Functions），
-- 前端 anon key 無法變更任何資金狀態。
