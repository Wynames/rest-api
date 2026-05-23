-- ============================================================
-- XT4 API - Fix Infinite Recursion & Case-Insensitive Trigger
-- ============================================================

-- 1. Hapus policy yang menyebabkan infinite recursion
DROP POLICY IF EXISTS "Admin Read Users" ON public.users;

-- 2. Policy aman: semua pengguna terautentikasi dapat melihat tabel users
CREATE POLICY "Allow authenticated read users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Perbaiki trigger role agar case-insensitive
-- Hapus trigger lama jika ada
DROP TRIGGER IF EXISTS trg_auto_adjust_limit ON public.users;
DROP FUNCTION IF EXISTS public.auto_adjust_limit_on_role_change();

-- Buat fungsi baru
CREATE OR REPLACE FUNCTION public.auto_adjust_limit_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF LOWER(NEW.role) = 'free' THEN
    NEW.limit_harian := 60;
  ELSIF LOWER(NEW.role) = 'vip' THEN
    NEW.limit_harian := 500;
  ELSIF LOWER(NEW.role) = 'lord' THEN
    NEW.limit_harian := 1500;
  ELSIF LOWER(NEW.role) = 'king''s' THEN
    NEW.limit_harian := 5000;
  ELSIF LOWER(NEW.role) IN ('developer', 'admin') THEN
    NEW.limit_harian := 999999999;
  END IF;
  RETURN NEW;
END;
$$;

-- Pasang trigger baru
CREATE TRIGGER trg_auto_adjust_limit
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_adjust_limit_on_role_change();
