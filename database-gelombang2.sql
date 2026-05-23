-- ============================================================
-- XT4 API - Gelombang 2: Foreign Key, RPC Approve, Storage Bucket
-- ============================================================

-- Pastikan foreign key upgrade_requests → users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user'
  ) THEN
    ALTER TABLE public.upgrade_requests
      ADD CONSTRAINT fk_user FOREIGN KEY (user_id)
      REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RPC untuk admin memproses upgrade (bypass RLS)
CREATE OR REPLACE FUNCTION public.approve_upgrade(
  req_id uuid,
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users SET role = new_role WHERE id = target_user_id;
  UPDATE public.upgrade_requests SET status = 'Approved' WHERE id = req_id;
END;
$$;

-- Buat storage bucket 'bukti_transfer' dan set policy public (jalankan via dashboard atau SQL)
-- Catatan: Pembuatan bucket lebih mudah lewat Supabase Dashboard > Storage.
-- Jika ingin via SQL, dapat menggunakan fungsi internal Supabase (tidak standar PostgreSQL).
-- Untuk kelengkapan, kami berikan perintah policy untuk bucket yang sudah ada:
-- Policy: mengizinkan insert untuk authenticated users
-- Policy: mengizinkan select untuk semua orang (public)
-- (Pastikan bucket sudah dibuat secara manual atau via dashboard)

-- Jika bucket sudah ada, atur policy:
-- (Jalankan di SQL Editor, sesuaikan nama bucket jika perlu)
-- BEGIN;
--   -- Izinkan pengguna terautentikasi mengunggah
--   CREATE POLICY "Allow authenticated uploads"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'bukti_transfer');
--
--   -- Izinkan publik membaca (untuk preview bukti)
--   CREATE POLICY "Allow public read"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'bukti_transfer');
-- COMMIT;
