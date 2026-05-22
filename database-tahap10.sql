-- ============================================================
-- XT4 API - Tahap 10: Trigger update limit_harian saat role berubah
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_limit_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role = 'Free' THEN
    NEW.limit_harian := 60;
  ELSIF NEW.role = 'VIP' THEN
    NEW.limit_harian := 500;
  ELSIF NEW.role = 'Lord' THEN
    NEW.limit_harian := 1500;
  ELSIF NEW.role = 'King''s' THEN   -- perhatikan double single quote
    NEW.limit_harian := 5000;
  ELSIF NEW.role = 'Developer' OR NEW.role = 'Admin' THEN
    NEW.limit_harian := 999999999;
  END IF;

  RETURN NEW;
END;
$$;

-- Pasang trigger pada tabel users
DROP TRIGGER IF EXISTS trg_update_limit_on_role_change ON public.users;
CREATE TRIGGER trg_update_limit_on_role_change
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_limit_on_role_change();
