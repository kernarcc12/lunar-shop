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

-- 6. Política: apenas o criador pode deletar seu produto
CREATE POLICY "Usuários podem deletar seus próprios produtos"
  ON produtos FOR DELETE
  USING (auth.uid() = criado_por);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_criado_por ON produtos(criado_por);