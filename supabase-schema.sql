-- ============================================
-- LUNAR PRODUTOS - Schema do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
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
  descricao TEXT NOT NULL DEFAULT '',
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 3. Política: qualquer pessoa pode ler produtos
CREATE POLICY "Produtos são públicos para leitura"
  ON produtos FOR SELECT
  USING (true);

-- 4. Política: apenas usuários autenticados podem inserir
CREATE POLICY "Usuários autenticados podem cadastrar produtos"
  ON produtos FOR INSERT
  WITH CHECK (auth.uid() = criado_por);

-- 5. Política: apenas o criador pode editar seu produto
CREATE POLICY "Usuários podem editar seus próprios produtos"
  ON produtos FOR UPDATE
  USING (auth.uid() = criado_por);

-- 5b. Política: admins podem editar qualquer produto
CREATE POLICY "Admins podem editar qualquer produto"
  ON produtos FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 6. Política: apenas o criador pode deletar seu produto
CREATE POLICY "Usuários podem deletar seus próprios produtos"
  ON produtos FOR DELETE
  USING (auth.uid() = criado_por);

-- 6b. Política: admins podem deletar qualquer produto
CREATE POLICY "Admins podem deletar qualquer produto"
  ON produtos FOR DELETE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_criado_por ON produtos(criado_por);

-- ============================================
-- SLIDES - Tabela de Slides do Slideshow
-- ============================================

-- 8. Tabela de slides
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

-- 9. Habilitar RLS
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- 10. Política: qualquer pessoa pode ler slides ativos
CREATE POLICY "Slides ativos são públicos para leitura"
  ON slides FOR SELECT
  USING (ativo = true);

-- 11. Política: admins podem ver todos os slides
CREATE POLICY "Admins podem ver todos os slides"
  ON slides FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 12. Política: apenas admins podem inserir slides
CREATE POLICY "Admins podem cadastrar slides"
  ON slides FOR INSERT
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 13. Política: apenas admins podem editar slides
CREATE POLICY "Admins podem editar slides"
  ON slides FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 14. Política: apenas admins podem deletar slides
CREATE POLICY "Admins podem deletar slides"
  ON slides FOR DELETE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 15. Índice para ordenação
CREATE INDEX IF NOT EXISTS idxSlidesOrdem ON slides(ordem);