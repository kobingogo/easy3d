-- Phase 2A: batch launch workbench

create table if not exists public.batch_jobs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('bags')),
  status text not null check (status in ('queued', 'running', 'partial_failed', 'completed', 'canceled')),
  total_count integer not null default 0 check (total_count >= 0),
  queued_count integer not null default 0 check (queued_count >= 0),
  processing_count integer not null default 0 check (processing_count >= 0),
  completed_count integer not null default 0 check (completed_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  started_at timestamptz null,
  completed_at timestamptz null,
  canceled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_job_id uuid not null references public.batch_jobs(id) on delete cascade,
  model_id uuid null references public.models(id) on delete set null,
  source_image_url text not null,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed', 'skipped')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text null,
  trip_task_id text null,
  locked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_batch_items_batch_job_id on public.batch_items(batch_job_id);
create index if not exists idx_batch_items_status on public.batch_items(status);
create index if not exists idx_batch_items_locked_at on public.batch_items(locked_at);
create unique index if not exists idx_batch_items_trip_task_id_unique on public.batch_items(trip_task_id) where trip_task_id is not null;

create or replace function public.set_batch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_batch_jobs_updated_at on public.batch_jobs;
create trigger trg_batch_jobs_updated_at
before update on public.batch_jobs
for each row execute procedure public.set_batch_updated_at();

drop trigger if exists trg_batch_items_updated_at on public.batch_items;
create trigger trg_batch_items_updated_at
before update on public.batch_items
for each row execute procedure public.set_batch_updated_at();
