-- Phase 2B: workflow templates + brand asset reuse
-- 兼容“表已存在但字段不完整”的场景，可重复执行

do $$
declare brand_profiles_kind "char";
declare workflow_templates_kind "char";
begin
  select c.relkind into brand_profiles_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'brand_profiles'
  limit 1;

  if brand_profiles_kind = 'v' then
    execute 'drop view public.brand_profiles cascade';
  elsif brand_profiles_kind = 'm' then
    execute 'drop materialized view public.brand_profiles cascade';
  elsif brand_profiles_kind = 'f' then
    execute 'drop foreign table public.brand_profiles cascade';
  end if;

  select c.relkind into workflow_templates_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'workflow_templates'
  limit 1;

  if workflow_templates_kind = 'v' then
    execute 'drop view public.workflow_templates cascade';
  elsif workflow_templates_kind = 'm' then
    execute 'drop materialized view public.workflow_templates cascade';
  elsif workflow_templates_kind = 'f' then
    execute 'drop foreign table public.workflow_templates cascade';
  end if;
end;
$$;

create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid()
);

alter table public.brand_profiles add column if not exists name text;
alter table public.brand_profiles add column if not exists category text;
alter table public.brand_profiles add column if not exists tone_profile jsonb;
alter table public.brand_profiles add column if not exists visual_rules jsonb;
alter table public.brand_profiles add column if not exists created_at timestamptz;
alter table public.brand_profiles add column if not exists updated_at timestamptz;

update public.brand_profiles
set
  name = coalesce(nullif(trim(name), ''), '品牌资产'),
  category = coalesce(category, 'bags'),
  tone_profile = coalesce(tone_profile, '{}'::jsonb),
  visual_rules = coalesce(visual_rules, '{}'::jsonb),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.brand_profiles alter column name set default '品牌资产';
alter table public.brand_profiles alter column category set default 'bags';
alter table public.brand_profiles alter column tone_profile set default '{}'::jsonb;
alter table public.brand_profiles alter column visual_rules set default '{}'::jsonb;
alter table public.brand_profiles alter column created_at set default now();
alter table public.brand_profiles alter column updated_at set default now();

alter table public.brand_profiles alter column name set not null;
alter table public.brand_profiles alter column category set not null;
alter table public.brand_profiles alter column tone_profile set not null;
alter table public.brand_profiles alter column visual_rules set not null;
alter table public.brand_profiles alter column created_at set not null;
alter table public.brand_profiles alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'brand_profiles_category_check'
      and conrelid = 'public.brand_profiles'::regclass
  ) then
    alter table public.brand_profiles
      add constraint brand_profiles_category_check
      check (category in ('bags'));
  end if;
end;
$$;

create table if not exists public.workflow_templates (
  id uuid primary key default gen_random_uuid()
);

alter table public.workflow_templates add column if not exists name text;
alter table public.workflow_templates add column if not exists category text;
alter table public.workflow_templates add column if not exists brand_profile_id uuid;
alter table public.workflow_templates add column if not exists template_payload jsonb;
alter table public.workflow_templates add column if not exists is_default boolean;
alter table public.workflow_templates add column if not exists created_at timestamptz;
alter table public.workflow_templates add column if not exists updated_at timestamptz;

update public.workflow_templates
set
  name = coalesce(nullif(trim(name), ''), '工作流模板'),
  category = coalesce(category, 'bags'),
  template_payload = coalesce(template_payload, '{}'::jsonb),
  is_default = coalesce(is_default, false),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.workflow_templates alter column name set default '工作流模板';
alter table public.workflow_templates alter column category set default 'bags';
alter table public.workflow_templates alter column template_payload set default '{}'::jsonb;
alter table public.workflow_templates alter column is_default set default false;
alter table public.workflow_templates alter column created_at set default now();
alter table public.workflow_templates alter column updated_at set default now();

alter table public.workflow_templates alter column name set not null;
alter table public.workflow_templates alter column category set not null;
alter table public.workflow_templates alter column template_payload set not null;
alter table public.workflow_templates alter column is_default set not null;
alter table public.workflow_templates alter column created_at set not null;
alter table public.workflow_templates alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workflow_templates_category_check'
      and conrelid = 'public.workflow_templates'::regclass
  ) then
    alter table public.workflow_templates
      add constraint workflow_templates_category_check
      check (category in ('bags'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workflow_templates_brand_profile_id_fkey'
      and conrelid = 'public.workflow_templates'::regclass
  ) then
    alter table public.workflow_templates
      add constraint workflow_templates_brand_profile_id_fkey
      foreign key (brand_profile_id)
      references public.brand_profiles(id)
      on delete set null;
  end if;
end;
$$;

-- 避免唯一索引创建失败：每个品类仅保留 1 个默认模板
with ranked_defaults as (
  select
    id,
    row_number() over (
      partition by category
      order by updated_at desc, created_at desc, id desc
    ) as rn
  from public.workflow_templates
  where is_default = true
)
update public.workflow_templates t
set is_default = false
from ranked_defaults r
where t.id = r.id
  and r.rn > 1;

create index if not exists idx_brand_profiles_category on public.brand_profiles(category);
create index if not exists idx_workflow_templates_category on public.workflow_templates(category);
create index if not exists idx_workflow_templates_brand_profile_id on public.workflow_templates(brand_profile_id);
create unique index if not exists idx_workflow_templates_default_per_category
  on public.workflow_templates(category)
  where is_default = true;

alter table public.batch_jobs
  add column if not exists workflow_template_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'batch_jobs_workflow_template_id_fkey'
      and conrelid = 'public.batch_jobs'::regclass
  ) then
    alter table public.batch_jobs
      add constraint batch_jobs_workflow_template_id_fkey
      foreign key (workflow_template_id)
      references public.workflow_templates(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists idx_batch_jobs_workflow_template_id on public.batch_jobs(workflow_template_id);

create or replace function public.set_phase2b_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_brand_profiles_updated_at on public.brand_profiles;
create trigger trg_brand_profiles_updated_at
before update on public.brand_profiles
for each row execute procedure public.set_phase2b_updated_at();

drop trigger if exists trg_workflow_templates_updated_at on public.workflow_templates;
create trigger trg_workflow_templates_updated_at
before update on public.workflow_templates
for each row execute procedure public.set_phase2b_updated_at();
