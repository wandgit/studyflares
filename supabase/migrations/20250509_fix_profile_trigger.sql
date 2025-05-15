-- Drop the old trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Create the correct trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    created_at,
    updated_at,
    last_seen_at,
    settings,
    metadata
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)  -- Use email username as fallback
    ),
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now(),
    now(),
    '{}'::jsonb,
    '{}'::jsonb
  );
  return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
