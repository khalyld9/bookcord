-- =============================================================
-- Development/demo seed data and storage configuration
-- =============================================================

-- Book cover storage bucket
insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

create policy "book covers are publicly readable"
on storage.objects for select
using (bucket_id = 'book-covers');

create policy "admins can upload book covers"
on storage.objects for insert
with check (
  bucket_id = 'book-covers'
  and (
    select public.is_admin()
  )
);

create policy "admins can update book covers"
on storage.objects for update
using (
  bucket_id = 'book-covers'
  and (
    select public.is_admin()
  )
);

create policy "admins can delete book covers"
on storage.objects for delete
using (
  bucket_id = 'book-covers'
  and (
    select public.is_admin()
  )
);

-- ---------------------------------------------------------------
-- Books and inventory
-- ---------------------------------------------------------------

do $$
declare
  v_sem1 uuid;
  v_sem2 uuid;
  v_stem uuid;
  v_abm uuid;
  v_humss uuid;
  v_gas uuid;
  v_tvl uuid;
  v_g11 uuid;
  v_g12 uuid;
  v_math uuid;
  v_sci uuid;
  v_eng uuid;
  v_fil uuid;
  v_acct uuid;
  v_prog uuid;
  v_res uuid;
  v_author_rex uuid;
  v_author_vibal uuid;
  v_author_phoenix uuid;
  v_author_cengage uuid;

  v_book_id uuid;
begin
  select id into v_sem1 from public.semesters where name = '1st Semester';
  select id into v_sem2 from public.semesters where name = '2nd Semester';
  select id into v_stem from public.strands where name = 'STEM';
  select id into v_abm from public.strands where name = 'ABM';
  select id into v_humss from public.strands where name = 'HUMSS';
  select id into v_gas from public.strands where name = 'GAS';
  select id into v_tvl from public.strands where name = 'TVL';
  select id into v_g11 from public.year_levels where name = 'Grade 11';
  select id into v_g12 from public.year_levels where name = 'Grade 12';
  select id into v_math from public.subjects where name = 'Mathematics';
  select id into v_sci from public.subjects where name = 'Science';
  select id into v_eng from public.subjects where name = 'English';
  select id into v_fil from public.subjects where name = 'Filipino';
  select id into v_acct from public.subjects where name = 'Accounting';
  select id into v_prog from public.subjects where name = 'Programming';
  select id into v_res from public.subjects where name = 'Research';
  select id into v_author_rex from public.authors where name = 'Rex Bookstore';
  select id into v_author_vibal from public.authors where name = 'Vibal Publishing';
  select id into v_author_phoenix from public.authors where name = 'Phoenix Publishing House';
  select id into v_author_cengage from public.authors where name = 'Cengage Learning';

  -- General Mathematics: STEM, Grade 11, available
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'General Mathematics', '978-971-23-1234-1', v_author_rex, v_math,
    'Core senior high school mathematics covering functions, rational expressions, and business math concepts.',
    v_sem1, v_stem, v_g11, 10
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 42, 42, 0 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- Physical Science: STEM, Grade 12, available
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'Physical Science', '978-971-23-1235-8', v_author_vibal, v_sci,
    'Introduction to physics, chemistry, and earth science for senior high school learners.',
    v_sem1, v_stem, v_g12, 8
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 30, 23, 7 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- Practical Research: STEM, Grade 11, low stock
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'Practical Research 1', '978-971-23-1236-5', v_author_phoenix, v_res,
    'Qualitative research methods for senior high school students.',
    v_sem2, v_stem, v_g11, 12
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 18, 5, 13 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- Accounting: ABM, Grade 12, available
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'Fundamentals of Accountancy, Business and Management 2',
    '978-971-23-1237-2', v_author_cengage, v_acct,
    'Advanced accounting principles, financial statements, and business management for ABM students.',
    v_sem2, v_abm, v_g12, 10
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 35, 20, 15 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- Business Mathematics: ABM, Grade 11, low stock
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'Business Mathematics', '978-971-23-1238-9', v_author_rex, v_math,
    'Mathematics applied to business, finance, buying, selling, and interest.',
    v_sem1, v_abm, v_g11, 15
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 20, 3, 17 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- Programming: TVL, Grade 12, out of stock
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'Computer Programming 2', '978-971-23-1239-6', v_author_vibal, v_prog,
    'Object-oriented programming and software development fundamentals for ICT learners.',
    v_sem2, v_tvl, v_g12, 6
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 14, 0, 14 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- English for Academic and Professional Purposes: HUMSS, Grade 12
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'English for Academic and Professional Purposes',
    '978-971-23-1240-2', v_author_phoenix, v_eng,
    'Academic reading, writing, and research communication for senior high school.',
    v_sem1, v_humss, v_g12, 10
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 26, 22, 4 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

  -- Filipino sa Piling Larangan: GAS, Grade 11
  insert into public.books (
    title, isbn, author_id, subject_id, description, semester_id,
    strand_id, year_level_id, minimum_stock
  ) values (
    'Filipino sa Piling Larangan',
    '978-971-23-1241-9', v_author_rex, v_fil,
    'Filipino for academic, artistic, and professional communication contexts.',
    v_sem2, v_gas, v_g11, 8
  )
  on conflict (isbn) do nothing
  returning id into v_book_id;

  insert into public.inventory (book_id, total_stock, available_stock, issued_stock)
  select id, 40, 32, 8 from public.books where id = v_book_id
  on conflict (book_id) do nothing;

end $$;
