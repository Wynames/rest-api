-- ============================================================
-- XT4 API - Fix: Kolom is_active & Tabel Characters
-- ============================================================

-- Tambah kolom is_active jika belum ada
ALTER TABLE public.api_endpoints ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Tabel karakter untuk API Waifu
CREATE TABLE IF NOT EXISTS public.characters (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  anime      text NOT NULL,
  image_url  text NOT NULL,
  gender     text NOT NULL
);

-- Isi data awal (3 cowo + 3 cewe)
INSERT INTO public.characters (name, anime, image_url, gender) VALUES
  ('Mikasa Ackerman', 'Attack on Titan', 'https://i.pinimg.com/originals/d0/d3/84/d0d38428d5f39d41a1438d5d7c4f7d44.jpg', 'cewe'),
  ('Rem', 'Re:Zero', 'https://i.pinimg.com/originals/3c/5f/3c/3c5f3c9b6c6f5c8e1e3e3d3d3d3d3d3d.jpg', 'cewe'),
  ('Asuna Yuuki', 'Sword Art Online', 'https://i.pinimg.com/originals/2a/3f/3a/2a3f3a0f3b3c1a8a3e3e3e3e3e3e3e3e.jpg', 'cewe'),
  ('Levi Ackerman', 'Attack on Titan', 'https://i.pinimg.com/originals/1b/3f/1b/1b3f1b1b3b1b3b1b3b1b3b1b3b1b3b1b.jpg', 'cowo'),
  ('Kirito', 'Sword Art Online', 'https://i.pinimg.com/originals/4b/3f/4b/4b3f4b4b4b4b4b4b4b4b4b4b4b4b4b4b.jpg', 'cowo'),
  ('Gojo Satoru', 'Jujutsu Kaisen', 'https://i.pinimg.com/originals/5c/3f/5c/5c3f5c5c5c5c5c5c5c5c5c5c5c5c5c5c.jpg', 'cowo');
