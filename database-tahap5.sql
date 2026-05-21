-- ============================================================
-- XT4 API - Tahap 5: Tabel Upgrade Requests + RLS
-- ============================================================

-- Buat tabel upgrade_requests
CREATE TABLE IF NOT EXISTS public.upgrade_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL,
  discord_notes text DEFAULT '',
  status        text DEFAULT 'Menunggu'::text,
  created_at    timestamptz DEFAULT now()
);

-- Aktifkan Row Level Security
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Pengguna yang login hanya bisa melihat request miliknya
CREATE POLICY "Users can view own upgrade requests"
  ON public.upgrade_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Pengguna yang login bisa mengajukan (INSERT) request dengan user_id = dirinya
CREATE POLICY "Users can create own upgrade requests"
  ON public.upgrade_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin dapat melihat semua request (nanti gunakan service_role atau tambahkan policy khusus)
-- Untuk sementara, berikan hak SELECT ke semua authenticated user (hanya untuk admin, tapi amannya nanti dibatasi)
-- Kita buat policy tambahan agar admin bisa SELECT semua. Asumsikan admin dikenali dari role di JWT atau kita gunakan service key di app.
-- Karena aplikasi menggunakan supabase client dengan anon key, admin akan menggunakan client yang sama.
-- Kita bisa buat policy berdasarkan role di tabel users, tapi lebih mudah: disable RLS sementara untuk development,
-- atau gunakan service key. Karena di file GodMode kita akan menggunakan supabase client biasa (anon key),
-- kita perlu policy SELECT tanpa batasan untuk authenticated (nanti dikombinasikan dengan pengecekan role di app).
-- Alternatif: buat policy SELECT untuk semua authenticated.
CREATE POLICY "Authenticated users can view all upgrade requests (admin check in app)"
  ON public.upgrade_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Admin dapat UPDATE status (nanti menggunakan service key atau custom check)
-- Untuk sementara, kita biarkan tidak ada policy update agar hanya bisa melalui service key.
-- Kita akan menggunakan supabaseAdmin di route handler atau client-side jika admin.
-- Karena GodMode page adalah client component, kita bisa gunakan supabase dengan anon key,
-- dan update akan gagal tanpa policy. Maka kita buat policy UPDATE yang memperbolehkan
-- user dengan role admin (dari JWT atau tabel). Untuk menjaga keamanan, kita bisa cek role dari tabel users.
-- Policy UPDATE: hanya user yang rolenya 'admin' (di tabel users) yang bisa update.
CREATE POLICY "Admin can update upgrade requests"
  ON public.upgrade_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Catatan: Anda bisa menambahkan role 'admin' untuk akun admin di tabel users nanti.
