-- ============================================================
-- XT4 API - Gelombang 3: Tabel api_logs & Policy Admin untuk api_endpoints
-- ============================================================

-- 1. Tabel api_logs
CREATE TABLE IF NOT EXISTS public.api_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  method      text NOT NULL,
  status_code integer NOT NULL,
  created_at  timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Policy: user bisa membaca log milik sendiri
CREATE POLICY "User can read own logs"
  ON public.api_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: admin/Developer bisa membaca semua log
CREATE POLICY "Admin can read all logs"
  ON public.api_logs
  FOR SELECT
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'Developer') );

-- 2. Policy agar admin bisa memasukkan/mengubah data api_endpoints
-- (untuk mengatasi error RLS saat menambahkan endpoint baru)
CREATE POLICY "Admin can manage api_endpoints"
  ON public.api_endpoints
  FOR ALL
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'Developer') );
