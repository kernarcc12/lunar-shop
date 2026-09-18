-- ============================================
-- LUNAR PRODUTOS - Schema do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
-- Seguro para re-executar (idempotente)
-- ============================================

-- 1. Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  preco_antigo NUMERIC(10, 2),
  imagem TEXT NOT NULL DEFAULT '',
  parcelas INTEGER NOT NULL DEFAULT 1,
  frete_gratis BOOLEAN NOT NULL DEFAULT false,
  avaliacao NUMERIC(2, 1) NOT NULL DEFAULT 5,
  vendidos INTEGER NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  descricao TEXT NOT NULL DEFAULT '',
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coluna quantidade para instancias ja existentes
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 0;

-- 2. Habilitar RLS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de produtos
DROP POLICY IF EXISTS "Produtos são públicos para leitura" ON produtos;
CREATE POLICY "Produtos são públicos para leitura"
  ON produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem cadastrar produtos" ON produtos;
CREATE POLICY "Usuários autenticados podem cadastrar produtos"
  ON produtos FOR INSERT WITH CHECK (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Usuários podem editar seus próprios produtos" ON produtos;
CREATE POLICY "Usuários podem editar seus próprios produtos"
  ON produtos FOR UPDATE USING (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Admins podem editar qualquer produto" ON produtos;
CREATE POLICY "Admins podem editar qualquer produto"
  ON produtos FOR UPDATE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios produtos" ON produtos;
CREATE POLICY "Usuários podem deletar seus próprios produtos"
  ON produtos FOR DELETE USING (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Admins podem deletar qualquer produto" ON produtos;
CREATE POLICY "Admins podem deletar qualquer produto"
  ON produtos FOR DELETE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_criado_por ON produtos(criado_por);

-- ============================================
-- SLIDES
-- ============================================

CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT '',
  subtitulo TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  imagem TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  texto_botao TEXT NOT NULL DEFAULT '',
  cor_fundo TEXT NOT NULL DEFAULT '#0B1120',
  cor_texto TEXT NOT NULL DEFAULT '#ffffff',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Slides ativos são públicos para leitura" ON slides;
CREATE POLICY "Slides ativos são públicos para leitura"
  ON slides FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Admins podem ver todos os slides" ON slides;
CREATE POLICY "Admins podem ver todos os slides"
  ON slides FOR SELECT USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins podem cadastrar slides" ON slides;
CREATE POLICY "Admins podem cadastrar slides"
  ON slides FOR INSERT WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins podem editar slides" ON slides;
CREATE POLICY "Admins podem editar slides"
  ON slides FOR UPDATE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins podem deletar slides" ON slides;
CREATE POLICY "Admins podem deletar slides"
  ON slides FOR DELETE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idxSlidesOrdem ON slides(ordem);

-- ============================================
-- FLYERS
-- ============================================

CREATE TABLE IF NOT EXISTS flyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  imagem TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'estatico' CHECK (tipo IN ('estatico', 'animado')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE flyers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Flyers ativos são públicos para leitura" ON flyers;
CREATE POLICY "Flyers ativos são públicos para leitura"
  ON flyers FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Admins podem ver todos os flyers" ON flyers;
CREATE POLICY "Admins podem ver todos os flyers"
  ON flyers FOR SELECT USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins podem cadastrar flyers" ON flyers;
CREATE POLICY "Admins podem cadastrar flyers"
  ON flyers FOR INSERT WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins podem editar flyers" ON flyers;
CREATE POLICY "Admins podem editar flyers"
  ON flyers FOR UPDATE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins podem deletar flyers" ON flyers;
CREATE POLICY "Admins podem deletar flyers"
  ON flyers FOR DELETE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idxFlyersOrdem ON flyers(ordem);
