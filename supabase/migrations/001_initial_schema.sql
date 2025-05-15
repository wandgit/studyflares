-- ==============================================
-- EduAI Companion Database Schema
-- ==============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ==============================================
-- Types and Enums
-- ==============================================

-- Safely create material_type enum
do $$ begin
  create type public.material_type as enum (
    'study_guide',
    'flashcards',
    'quiz',
    'concept_map',
    'exam',
    'practice_exam'
  );
exception
  when duplicate_object then null;
end $$;

-- Safely create document_status enum
do $$ begin
  create type public.document_status as enum (
    'processing',
    'completed',
    'error'
  );
exception
  when duplicate_object then null;
end $$;

-- Safely create study_session_type enum
do $$ begin
  create type public.study_session_type as enum (
    'reading',
    'practice',
    'quiz',
    'exam'
  );
exception
  when duplicate_object then null;
end $$;

-- ==============================================
-- Core Tables
-- ==============================================

-- User profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  school text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  last_seen_at timestamptz default now(),
  settings jsonb default '{
    "theme": "light",
    "notifications": true,
    "studyReminders": true
  }'::jsonb,
  metadata jsonb default '{}'::jsonb,
  constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  constraint valid_name check (char_length(full_name) >= 2)
);

-- Study materials
-- Exams table for storing exam configurations
create table public.exams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  duration interval not null,
  total_marks integer not null,
  passing_marks integer not null,
  is_practice boolean default false,
  allowed_attempts integer default 1,
  show_results boolean default true,
  shuffle_questions boolean default true,
  time_per_question interval,
  instructions text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb,
  constraint valid_exam_title check (char_length(title) >= 3),
  constraint valid_marks check (passing_marks <= total_marks)
);

-- Questions table for exam questions
create table public.exam_questions (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  marks integer not null check (marks > 0),
  options jsonb,
  correct_answer text,
  explanation text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb
);

-- Exam attempts to track user attempts
create table public.exam_attempts (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  score numeric(5,2),
  status text not null check (status in ('in_progress', 'completed', 'abandoned')),
  answers jsonb default '{}'::jsonb,
  feedback jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb,
  unique(exam_id, user_id, start_time)
);

-- Study materials table
create table public.study_materials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type material_type not null,
  content jsonb not null,
  exam_id uuid references public.exams(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_title check (char_length(title) >= 3)
);

-- Uploaded documents
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  file_path text not null,
  file_type text not null,
  file_size integer not null check (file_size > 0),
  status document_status not null default 'processing',
  content_text text,
  content_summary text,
  key_concepts text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  error_message text
);

-- Study progress
create table public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid references public.study_materials(id) on delete set null,
  session_type study_session_type not null,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration interval generated always as (end_time - start_time) stored,
  progress jsonb default '{
    "completed": false,
    "score": null,
    "correct_answers": 0,
    "total_questions": 0
  }'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Study statistics
create table public.user_statistics (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_study_time interval default '0'::interval not null,
  total_sessions integer default 0 not null,
  completed_materials integer default 0 not null,
  average_score numeric(5,2) default 0 check (average_score between 0 and 100),
  streak_days integer default 0 not null,
  last_study_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb
);

-- ==============================================
-- Indexes
-- ==============================================

create index idx_profiles_email on public.profiles(email);
create index idx_study_materials_user_id on public.study_materials(user_id);
create index idx_study_materials_type on public.study_materials(type);
create index idx_study_materials_exam_id on public.study_materials(exam_id);
create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_status on public.documents(status);
create index idx_study_sessions_user_id on public.study_sessions(user_id);
create index idx_study_sessions_material_id on public.study_sessions(material_id);
create index idx_exams_user_id on public.exams(user_id);
create index idx_exam_questions_exam_id on public.exam_questions(exam_id);
create index idx_exam_attempts_user_id on public.exam_attempts(user_id);
create index idx_exam_attempts_exam_id on public.exam_attempts(exam_id);
create index idx_exam_attempts_status on public.exam_attempts(status);

-- ==============================================
-- Functions and Triggers
-- ==============================================

-- Function to update timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1)
    )
  );

  -- Initialize statistics
  insert into public.user_statistics (user_id)
  values (new.id);

  return new;
end;
$$;

-- Function to update study statistics
create or replace function public.update_study_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only process completed sessions
  if (new.end_time is not null and new.progress->>'completed' = 'true') then
    update public.user_statistics
    set
      total_study_time = total_study_time + new.duration,
      total_sessions = total_sessions + 1,
      completed_materials = case 
        when new.session_type in ('quiz', 'exam') then completed_materials + 1
        else completed_materials
      end,
      average_score = case
        when new.progress->>'score' is not null then
          (average_score * completed_materials + (new.progress->>'score')::numeric) / (completed_materials + 1)
        else average_score
      end,
      streak_days = case
        when last_study_date = current_date - interval '1 day' then streak_days + 1
        when last_study_date = current_date then streak_days
        else 1
      end,
      last_study_date = current_date,
      updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end;
$$;

-- ==============================================
-- Trigger Assignments
-- ==============================================

-- Auto-update timestamps
drop trigger if exists handle_updated_at on public.profiles;
drop trigger if exists handle_updated_at on public.study_materials;
drop trigger if exists handle_updated_at on public.documents;
drop trigger if exists handle_updated_at on public.study_sessions;
drop trigger if exists handle_updated_at on public.user_statistics;

create trigger handle_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.study_materials
  for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.documents
  for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.study_sessions
  for each row execute function public.handle_updated_at();
create trigger handle_updated_at before update on public.user_statistics
  for each row execute function public.handle_updated_at();

-- Handle new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update study statistics
drop trigger if exists on_study_session_change on public.study_sessions;
create trigger on_study_session_change
  after insert or update on public.study_sessions
  for each row execute function public.update_study_stats();

-- ==============================================
-- Row Level Security Policies
-- ==============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.study_materials enable row level security;
alter table public.documents enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_statistics enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Study materials policies
create policy "Users can view own materials"
  on public.study_materials for select
  using (auth.uid() = user_id);

create policy "Users can create materials"
  on public.study_materials for insert
  with check (auth.uid() = user_id);

create policy "Users can update own materials"
  on public.study_materials for update
  using (auth.uid() = user_id);

create policy "Users can delete own materials"
  on public.study_materials for delete
  using (auth.uid() = user_id);

-- Documents policies
create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can create documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Study sessions policies
create policy "Users can view own sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id);

-- Statistics policies
create policy "Users can insert their own statistics"
  on public.user_statistics for insert
  with check (auth.uid() = user_id);

create policy "Users can view own statistics"
  on public.user_statistics for select
  using (auth.uid() = user_id);

create policy "Users can update own statistics"
  on public.user_statistics for update
  using (auth.uid() = user_id);



-- Exam policies
create policy "Users can view own exams"
  on public.exams for select
  using (auth.uid() = user_id);

create policy "Users can create exams"
  on public.exams for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exams"
  on public.exams for update
  using (auth.uid() = user_id);

create policy "Users can delete own exams"
  on public.exams for delete
  using (auth.uid() = user_id);

-- Exam questions policies
create policy "Users can view questions of own exams"
  on public.exam_questions for select
  using (exists (
    select 1 from public.exams
    where id = exam_id
    and user_id = auth.uid()
  ));

create policy "Users can create questions for own exams"
  on public.exam_questions for insert
  with check (exists (
    select 1 from public.exams
    where id = exam_id
    and user_id = auth.uid()
  ));

create policy "Users can update questions of own exams"
  on public.exam_questions for update
  using (exists (
    select 1 from public.exams
    where id = exam_id
    and user_id = auth.uid()
  ));

create policy "Users can delete questions of own exams"
  on public.exam_questions for delete
  using (exists (
    select 1 from public.exams
    where id = exam_id
    and user_id = auth.uid()
  ));

-- Exam attempts policies
create policy "Users can view own exam attempts"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

create policy "Users can create own exam attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exam attempts"
  on public.exam_attempts for update
  using (auth.uid() = user_id);
