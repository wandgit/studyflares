-- Drop the old trigger first
-- First, drop the existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Add bypass policy for the trigger function
create policy "Allow trigger function to create profiles"
  on public.profiles for insert
  to postgres -- This is the superuser in Supabase
  with check (true);

-- Create the correct trigger function with better error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  profile_id uuid;
begin
  -- Create a new profile record
  insert into public.profiles (id, full_name, school, created_at, updated_at)
  values (
    new.id, -- Use the auth.users id as the profile id
    '', -- Empty full_name to be filled during profile setup
    '', -- Empty school to be filled during profile setup
    now(),
    now()
  )
  returning id into profile_id;

  -- Raise notice for debugging
  raise notice 'Created new profile with ID: %', profile_id;

  return new;
exception
  when others then
    -- Log the error details
    raise notice 'Error in handle_new_user: %', SQLERRM;
    return new; -- Still return new to allow the auth.user creation
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;  -- Log the attempt
  raise notice 'Creating profile for user %', new.id;
  
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
  )
  returning id into profile_id;

  -- Log success
  raise notice 'Successfully created profile % for user %', profile_id, new.id;
  
  return new;
exception
  when others then
    -- Log the error
    raise warning 'Failed to create profile for user %. Error: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to postgres;
grant all on public.profiles to postgres;
