-- ============================================
-- SUPABASE STORAGE - Bucket de imagens
-- Execute este SQL no Supabase SQL Editor
-- Seguro para re-executar (idempotente)
-- ============================================

-- 1. Criar bucket 'images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas
DROP POLICY IF EXISTS "Imagens públicas para leitura" ON storage.objects;
CREATE POLICY "Imagens públicas para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Usuários autenticados podem enviar imagens" ON storage.objects;
CREATE POLICY "Usuários autenticados podem enviar imagens"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários podem deletar suas imagens" ON storage.objects;
CREATE POLICY "Usuários podem deletar suas imagens"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Admins podem deletar qualquer imagem" ON storage.objects;
CREATE POLICY "Admins podem deletar qualquer imagem"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 3. Configurações do bucket
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
WHERE id = 'images';
