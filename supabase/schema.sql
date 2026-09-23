-- Apply in the dedicated Supabase project for kaoyanfuxi, not another website.
-- References: Supabase official RLS and Database Functions documentation.
begin;
create table if not exists public.kaoyan_records (
 user_id uuid not null references auth.users(id) on delete cascade,
 bucket text not null check (bucket in ('task','day','note','cfg','attempt','focus','question','bookmark')),
 record_id text not null check (length(record_id) between 1 and 180),
 payload jsonb not null check (jsonb_typeof(payload)='object' and octet_length(payload::text)<=200000),
 deleted boolean not null default false,
 revision bigint not null default 1 check (revision>0),
 updated_at timestamptz not null default now(),
 primary key (user_id,bucket,record_id)
);
alter table public.kaoyan_records enable row level security;
revoke all on public.kaoyan_records from anon, authenticated;
grant select, insert, update on public.kaoyan_records to authenticated;
drop policy if exists "kaoyan_select_own" on public.kaoyan_records;
create policy "kaoyan_select_own" on public.kaoyan_records for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "kaoyan_insert_own" on public.kaoyan_records;
create policy "kaoyan_insert_own" on public.kaoyan_records for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "kaoyan_update_own" on public.kaoyan_records;
create policy "kaoyan_update_own" on public.kaoyan_records for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- Compare-and-swap: an old device cannot silently replace a newer cloud record.
create or replace function public.kaoyan_put_record(p_bucket text,p_id text,p_payload jsonb,p_deleted boolean,p_expected bigint)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.kaoyan_records; ok boolean:=false; u uuid:=(select auth.uid());
begin
 if u is null then raise exception 'Authentication required'; end if;
 if p_expected is null or p_expected<0 then raise exception 'Invalid revision'; end if;
 if p_expected=0 then
   insert into public.kaoyan_records(user_id,bucket,record_id,payload,deleted,revision)
   values(u,p_bucket,p_id,p_payload,p_deleted,1)
   on conflict(user_id,bucket,record_id) do nothing returning * into r;
   ok:=found;
 else
   update public.kaoyan_records set payload=p_payload,deleted=p_deleted,revision=revision+1,updated_at=now()
   where user_id=u and bucket=p_bucket and record_id=p_id and revision=p_expected returning * into r;
   ok:=found;
 end if;
 if not ok then select * into r from public.kaoyan_records where user_id=u and bucket=p_bucket and record_id=p_id; end if;
 return jsonb_build_object('ok',ok,'record',to_jsonb(r));
end $$;
revoke all on function public.kaoyan_put_record(text,text,jsonb,boolean,bigint) from public,anon;
grant execute on function public.kaoyan_put_record(text,text,jsonb,boolean,bigint) to authenticated;
commit;
