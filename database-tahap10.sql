-- ============================================================
-- XT4 API - Tahap 10: Trigger Otomatis Limit Saat Role Diubah
-- ============================================================

-- Function untuk menyesuaikan limit_harian ketika role di-update
CREATE OR REPLACE FUNCTION public.auto_adjust_limit_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Sesuaikan limit_harian berdasarkan role baru
  IF NEW.role = 'Free' THEN
    NEW.limit_harian := 60;
  ELSIF NEW.role = 'VIP' THEN
    NEW.limit_harian := 500;
  ELSIF NEW.role = 'Lord' THEN
    NEW.limit_harian := 1500;
  ELSIF NEW.role = 'King''s' OR NEW.role = 'King\'s' THEN
    NEW.limit_harian := 5000;
  ELSIF NEW.role = 'Developer' OR NEW.role = 'Admin' OR NEW.role = 'admin' THEN
    NEW.limit_harian := 999999999;
  END IF;

  RETURN NEW;
END;
$$;

-- Pasang trigger pada tabel users
DROP TRIGGER IF EXISTS trigger_adjust_limit_on_role_change ON public.users;
CREATE TRIGGER trigger_adjust_limit_on_role_change
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.auto_adjust_limit_on_role_change();
