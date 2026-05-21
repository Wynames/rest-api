-- ============================================================
-- XT4 API - Database Schema & Row Level Security
-- ============================================================

-- 1. Tabel Users (relasi ke auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE NOT NULL,
  email         text UNIQUE NOT NULL,
  role          text DEFAULT 'Free'::text,
  limit_harian  integer DEFAULT 60,
  status        text DEFAULT 'active'::text,
  created_at    timestamptz DEFAULT now()
);

-- 2. Tabel API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_key    text UNIQUE NOT NULL,
  is_custom  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Tabel API Endpoints (katalog endpoint)
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  category          text NOT NULL,
  path              text NOT NULL,
  method            text NOT NULL,
  response_example  jsonb,
  created_at        timestamptz DEFAULT now()
);

-- ============================================================
-- Aktifkan Row Level Security
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies: Users
-- ============================================================
-- User hanya bisa melihat & update data dirinya sendiri
CREATE POLICY "Users can view own user"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own user"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- (Insert dilakukan otomatis oleh trigger, tidak memerlukan policy untuk user)

-- ============================================================
-- Policies: API Keys
-- ============================================================
-- User hanya bisa mengelola API key miliknya
CREATE POLICY "Users can CRUD own api_keys"
  ON public.api_keys
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Policies: API Endpoints (katalog publik untuk authenticated user)
-- ============================================================
CREATE POLICY "Authenticated users can read endpoints"
  ON public.api_endpoints
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- (Hanya admin yang bisa mengubah katalog, bisa ditambahkan nanti)

-- ============================================================
-- Trigger: Otomatis insert ke public.users setelah sign up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'username' IS NULL THEN
    RAISE EXCEPTION 'Username is required in user metadata';
  END IF;

  INSERT INTO public.users (id, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
