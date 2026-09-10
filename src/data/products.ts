export type Product = {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  precoAntigo?: number;
  imagem: string;
  parcelas: number;
  freteGratis: boolean;
  avaliacao: number;
  vendidos: number;
  descricao: string;
};

export const categorias = [
  "Tecnologia",
  "Artesanato",
  "Caça & Pesca",
  "Cosmeticos",
  "Acessórios",
] as const;

const produtosIniciais: Product[] = [];

const STORAGE_KEY = "lunar_produtos_cadastrados";

function carregarProdutosCadastrados(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function salvarProdutoCadastrado(produto: Product) {
  const existentes = carregarProdutosCadastrados();
  existentes.push(produto);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
}

export const produtos: Product[] = [
  ...produtosIniciais,
  ...carregarProdutosCadastrados(),
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const getProduto = (id: string) => produtos.find((p) => p.id === id);
