-- ============================================================
-- XT4 API - Gelombang 1: Fix Docs Kosong & Relasi
-- ============================================================

-- Pastikan RLS aktif untuk api_endpoints
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama yang mungkin membatasi akses publik
DROP POLICY IF EXISTS "Public read active endpoints" ON public.api_endpoints;
DROP POLICY IF EXISTS "Authenticated users can read endpoints" ON public.api_endpoints;

-- Policy baru: siapa pun bisa membaca endpoint yang is_active = true
CREATE POLICY "Public read active endpoints"
  ON public.api_endpoints
  FOR SELECT
  USING (is_active = true);

-- Pastikan foreign key upgrade_requests ke users valid (sudah ada di skema awal, tapi tambahkan jika belum)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'upgrade_requests_user_id_fkey'
  ) THEN
    ALTER TABLE public.upgrade_requests
      ADD CONSTRAINT upgrade_requests_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;
