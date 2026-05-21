-- ============================================================
-- XT4 API - Tahap 4: RPC & Update Limit Default
-- ============================================================

-- Pastikan default limit_harian adalah 60 untuk user baru (Free)
ALTER TABLE public.users ALTER COLUMN limit_harian SET DEFAULT 60;

-- Perbaiki juga user yang sudah ada tetapi limit_harian-nya NULL
UPDATE public.users SET limit_harian = 60 WHERE limit_harian IS NULL;

-- ============================================================
-- Function: decrement_api_limit (RPC)
-- Menjamin atomic operation untuk mengurangi limit
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_api_limit(api_key_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id uuid;
  current_limit integer;
BEGIN
  -- Cari user_id berdasarkan api_key
  SELECT user_id INTO target_user_id
  FROM public.api_keys
  WHERE api_key = api_key_input;

  -- Jika tidak ditemukan, return false
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Ambil limit_harian saat ini dengan row lock (SELECT ... FOR UPDATE)
  -- untuk mencegah race condition
  SELECT limit_harian INTO current_limit
  FROM public.users
  WHERE id = target_user_id
  FOR UPDATE;  -- kunci baris sampai transaksi selesai

  -- Jika limit tidak ditemukan atau sudah <= 0
  IF current_limit IS NULL OR current_limit <= 0 THEN
    RETURN false;
  END IF;

  -- Kurangi limit sebesar 1
  UPDATE public.users
  SET limit_harian = current_limit - 1
  WHERE id = target_user_id;

  RETURN true;
END;
$$;
