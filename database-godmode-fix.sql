-- WAJIB DI-RUN DI SUPABASE SQL EDITOR
-- Fungsi RPC untuk admin mengedit user (melewati RLS)
CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_user_id uuid,
  new_role text,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users SET role = new_role, status = new_status WHERE id = target_user_id;
END;
$$;
