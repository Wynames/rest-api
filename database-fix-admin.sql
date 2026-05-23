-- ============================================================
-- XT4 API - Fix Admin: Policy RLS untuk Admin/Developer
-- ============================================================

-- Admin bisa mengakses semua upgrade_requests
CREATE POLICY "Admin Full Access Upgrade" ON public.upgrade_requests
FOR ALL
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'Developer')
);

-- Admin bisa membaca semua data users
CREATE POLICY "Admin Read Users" ON public.users
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'Developer')
);
