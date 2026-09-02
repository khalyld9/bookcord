-- =============================================================
-- Allow anonymous visitors to read the reference data needed by
-- the signup form.
--
-- The signup page is rendered before the user is authenticated,
-- so auth.role() is 'anon'. The original policies only allowed
-- 'authenticated' reads, which filtered out every row and left
-- the Grade Level / Strand dropdowns empty.
-- =============================================================

drop policy if exists "year levels read public" on public.year_levels;
create policy "year levels read public"
  on public.year_levels for select
  using (true);

drop policy if exists "strands read public" on public.strands;
create policy "strands read public"
  on public.strands for select
  using (true);
