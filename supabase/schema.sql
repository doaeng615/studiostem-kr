-- Studio Stem portfolio CMS schema
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists portfolio_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  industry text not null default '',
  badge text not null default '',
  problem text not null default '',
  direction text not null default '',
  output text not null default '',
  thumbnail_url text,
  content jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table portfolio_posts enable row level security;

create policy "Public can read published posts"
  on portfolio_posts for select
  using (status = 'published');

create policy "Authenticated can read all posts"
  on portfolio_posts for select
  to authenticated
  using (true);

create policy "Authenticated can insert posts"
  on portfolio_posts for insert
  to authenticated
  with check (true);

create policy "Authenticated can update posts"
  on portfolio_posts for update
  to authenticated
  using (true);

create policy "Authenticated can delete posts"
  on portfolio_posts for delete
  to authenticated
  using (true);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists portfolio_posts_updated_at on portfolio_posts;
create trigger portfolio_posts_updated_at
before update on portfolio_posts
for each row execute function set_updated_at();

-- Storage policies (create the "portfolio-thumbnails" and "portfolio-media"
-- buckets as PUBLIC in the Storage dashboard first, then run this)
create policy "Public can view thumbnails"
  on storage.objects for select
  to public
  using (bucket_id = 'portfolio-thumbnails');

create policy "Authenticated can upload thumbnails"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-thumbnails');

create policy "Authenticated can update thumbnails"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-thumbnails');

create policy "Authenticated can delete thumbnails"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-thumbnails');

create policy "Public can view media"
  on storage.objects for select
  to public
  using (bucket_id = 'portfolio-media');

create policy "Authenticated can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media');

create policy "Authenticated can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media');

create policy "Authenticated can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media');

-- Seed existing 3 case studies (uses images already deployed on the live site)
insert into portfolio_posts (slug, title, industry, badge, problem, direction, output, thumbnail_url, status, sort_order) values
('black-bowl', 'BLACK BOWL', 'F&B · Greek Yogurt Bar', 'BRAND START',
 '브랜드가 가진 장점은 분명했지만 고객에게 전달되는 이미지와 시각적인 기준이 정리되어 있지 않았습니다.',
 '그릭요거트 브랜드의 핵심인 담백하고 절제된 인상을 중심으로 로고, 컬러와 그래픽을 설계하고 패키지와 SNS 콘텐츠까지 확장했습니다.',
 'Brand Identity · Package · Menu · SNS Content',
 'https://studiostem.kr/assets/work/black-bowl.png', 'published', 1),
('brut', 'BRUT', 'F&B · Coffee Package', 'DESIGN PLUS',
 '원두마다 다른 산지와 풍미가 있었지만, 패키지에서는 그 차이가 드러나지 않고 비슷하게 보였습니다.',
 '산지별 원두의 개성을 원산지 코드와 사진, 타이포그래피로 구분해 보여주는 패키지 시스템을 설계했습니다.',
 'Brand Identity · Package · Label System',
 'https://studiostem.kr/assets/work/brut.png', 'published', 2),
('juheung', '주흥', 'F&B · Cocktail Bar', 'OPENING KIT',
 '공간의 분위기는 완성되어 있었지만, 이를 뒷받침하는 그래픽과 메뉴 시스템이 없어 경험이 매장 밖으로 이어지지 못했습니다.',
 '공간의 조명과 질감에서 착안한 딥레드 톤의 심볼과 타이포그래피를 중심으로 사이니지, 메뉴판, 냅킨 등 매장 그래픽 전반을 설계했습니다.',
 'Brand Identity · Signage · Menu · Print',
 'https://studiostem.kr/assets/work/juheung.png', 'published', 3)
on conflict (slug) do nothing;
