import fone from "@/assets/p-fone.jpg";
import perfume from "@/assets/p-perfume.jpg";
import smartwatch from "@/assets/p-smartwatch.jpg";
import caixa from "@/assets/p-caixa.jpg";
import aroma from "@/assets/p-aroma.jpg";
import carregador from "@/assets/p-carregador.jpg";

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
  "Fragrâncias",
  "Casa & Aromas",
  "Acessórios",
] as const;

const produtosIniciais: Product[] = [
  {
    id: "fone-bluetooth-gold",
    nome: "Fone de Ouvido Bluetooth Lunar Gold com Cancelamento de Ruído",
    categoria: "Tecnologia",
    preco: 249.9,
    precoAntigo: 399.9,
    imagem: fone,
    parcelas: 10,
    freteGratis: true,
    avaliacao: 4.8,
    vendidos: 1320,
    descricao:
      "Som imersivo, cancelamento ativo de ruído e até 30h de bateria. Acabamento preto com detalhes dourados, confortável para o dia todo.",
  },
  {
    id: "perfume-lunar-essence",
    nome: "Perfume Lunar Essence Eau de Parfum 100ml",
    categoria: "Fragrâncias",
    preco: 189.9,
    precoAntigo: 259.9,
    imagem: perfume,
    parcelas: 8,
    freteGratis: true,
    avaliacao: 4.9,
    vendidos: 2410,
    descricao:
      "Fragrância amadeirada com notas de baunilha e âmbar. Alta fixação, ideal para a noite.",
  },
  {
    id: "smartwatch-lunar-w9",
    nome: "Smartwatch Lunar W9 Tela AMOLED com Monitor Cardíaco",
    categoria: "Tecnologia",
    preco: 329.9,
    precoAntigo: 499.9,
    imagem: smartwatch,
    parcelas: 12,
    freteGratis: true,
    avaliacao: 4.6,
    vendidos: 870,
    descricao:
      "Chamadas por Bluetooth, monitor cardíaco e de sono, mais de 100 modos esportivos e resistência à água IP68.",
  },
  {
    id: "caixa-som-portatil",
    nome: "Caixa de Som Portátil Bluetooth 20W à Prova d'Água",
    categoria: "Tecnologia",
    preco: 179.9,
    imagem: caixa,
    parcelas: 6,
    freteGratis: false,
    avaliacao: 4.5,
    vendidos: 540,
    descricao:
      "Graves potentes, 12h de reprodução e proteção IPX7. Leve para a praia, piscina ou churrasco.",
  },
  {
    id: "kit-vela-difusor",
    nome: "Kit Vela Aromática + Difusor de Varetas Lunar Home",
    categoria: "Casa & Aromas",
    preco: 129.9,
    precoAntigo: 169.9,
    imagem: aroma,
    parcelas: 5,
    freteGratis: false,
    avaliacao: 4.7,
    vendidos: 320,
    descricao:
      "Kit com vela de cera vegetal e difusor de varetas 250ml. Perfuma o ambiente por até 60 dias.",
  },
  {
    id: "carregador-turbo-usbc",
    nome: "Carregador Turbo USB-C 30W com Cabo Reforçado",
    categoria: "Acessórios",
    preco: 79.9,
    precoAntigo: 119.9,
    imagem: carregador,
    parcelas: 3,
    freteGratis: false,
    avaliacao: 4.4,
    vendidos: 1980,
    descricao:
      "Carregamento rápido para celulares e tablets, com proteção contra sobrecarga e cabo trançado de 1,2m.",
  },
];

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
