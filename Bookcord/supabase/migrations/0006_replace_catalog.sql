-- ===============================================================
-- 0006: Replace the catalog with the school's real modules
--
-- The seeded sample titles are removed and replaced by the two
-- Lyceum of Alabang learning modules (covers served from the app's
-- /covers static folder) plus one coverless test title so the grey
-- Booky placeholder stays visible.
-- ===============================================================

-- Clear dependent rows first (FKs use restrict/cascade in places).
delete from public.saved_books;
delete from public.hold_requests;
delete from public.reservations;
delete from public.stock_movements;
delete from public.book_returns;
delete from public.book_issues;
delete from public.restocks;
delete from public.inventory;
delete from public.books;

-- Reference data used by the new titles.
insert into public.strands (name)
values ('ICT')
on conflict (name) do update set archived_at = null;

insert into public.year_levels (name, sort_order)
values ('Grade 11', 11), ('Grade 12', 12)
on conflict (name) do update set archived_at = null;

insert into public.authors (name)
values ('Shermaine E. De Castro'), ('Thomas Eric C. Paulin')
on conflict (name) do update set archived_at = null;

insert into public.subjects (name)
values ('Filipino'), ('Literature')
on conflict (name) do update set archived_at = null;

insert into public.semesters (name)
values ('1st Semester'), ('2nd Semester')
on conflict (name) do nothing;

-- The new catalog.
insert into public.books (
  title, isbn, author_id, subject_id, semester_id, strand_id,
  year_level_id, description, cover_image_url, minimum_stock
)
values
  (
    'Filipino sa Piling Larang Tech-Voc',
    '978-621-8000-01-1',
    (select id from public.authors where name = 'Shermaine E. De Castro'),
    (select id from public.subjects where name = 'Filipino'),
    (select id from public.semesters where name = '1st Semester'),
    (select id from public.strands where name = 'ICT'),
    (select id from public.year_levels where name = 'Grade 11'),
    'Learning module, 2020 edition, exclusively for Lyceum of Alabang students.',
    '/covers/filipino-sa-piling-larang-tech-voc.png',
    2
  ),
  (
    '21st Century Literature from the Philippines and the World',
    '978-621-8000-02-8',
    (select id from public.authors where name = 'Thomas Eric C. Paulin'),
    (select id from public.subjects where name = 'Literature'),
    (select id from public.semesters where name = '1st Semester'),
    (select id from public.strands where name = 'ICT'),
    (select id from public.year_levels where name = 'Grade 12'),
    'Learning module, 2020 edition, exclusively for Lyceum of Alabang students.',
    '/covers/21st-century-literature-ph-world.png',
    2
  ),
  (
    'Blank Test Book',
    null,
    null,
    null,
    null,
    (select id from public.strands where name = 'ICT'),
    (select id from public.year_levels where name = 'Grade 11'),
    'Coverless placeholder used to test the grey Booky cover.',
    null,
    0
  );

-- Shelf stock for every (new) title.
insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
select id, 10, 10, 0
from public.books;
