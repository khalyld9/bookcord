-- ===============================================================
-- 0011: Booky chat notifications
-- Run after 0009_account_notifications.sql.
-- ===============================================================

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'ACCOUNT_CREATED',
      'PASSWORD_RESET',
      'PASSWORD_CHANGED',
      'RESTOCK_REQUEST',
      'RESTOCK_RESOLVED',
      'RESERVATION_READY',
      'BOOKY_CHAT'
    )
  );

create or replace function public.on_booky_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student text;
begin
  if new.sender = 'ADMIN' then
    insert into public.notifications (profile_id, type, title, body, href)
    values (
      new.profile_id,
      'BOOKY_CHAT',
      'New Booky chat reply',
      'The Bookstore team replied to your message.',
      '/books'
    );
  else
    select coalesce(full_name, 'A student') into v_student
      from public.profiles where id = new.profile_id;

    perform public.notify_every_admin(
      'BOOKY_CHAT',
      'New Booky chat message',
      v_student || ' sent a message to the Bookstore team.',
      '/admin/chat?profile=' || new.profile_id::text
    );
  end if;
  return new;
end $$;

drop trigger if exists chat_messages_notify on public.chat_messages;

create trigger chat_messages_notify
after insert on public.chat_messages
for each row execute function public.on_booky_chat_message();
