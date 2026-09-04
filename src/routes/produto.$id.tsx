import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import { brl, getProduto, produtos } from "@/data/products";
import { addToCart } from "@/lib/cart";

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }) => {
    const produto = getProduto(params.id);
    if (!produto) throw notFound();
    return { produto };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produto indisponível | Lunar Produtos" }, { name: "robots", content: "noindex" }],
      };
    }
    const { produto } = loaderData;
    return {
      meta: [
        { title: `${produto.nome} | Lunar Produtos` },
        { name: "description", content: produto.descricao },
        { property: "og:title", content: `${produto.nome} — ${brl(produto.preco)}` },
        { property: "og:description", content: produto.descricao },
      ],
    };
  },
  component: ProdutoPage,
});

function ProdutoPage() {
  const { produto } = Route.useLoaderData();
  const navigate = useNavigate();
  const relacionados = produtos.filter((p) => p.id !== produto.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Início
          </Link>{" "}
          / <span>{produto.categoria}</span>
        </nav>

        <div className="grid gap-8 rounded-lg border border-border bg-card p-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-lg bg-white p-6">
            <img
              src={produto.imagem}
              alt={produto.nome}
              width={800}
              height={800}
              className="mx-auto h-[420px] w-full object-contain"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              {produto.vendidos.toLocaleString("pt-BR")} vendidos
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{produto.nome}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-gold text-gold" /> {produto.avaliacao.toFixed(1)}
            </p>

            {produto.precoAntigo && (
              <p className="mt-4 text-sm text-muted-foreground line-through">
                {brl(produto.precoAntigo)}
              </p>
            )}
            <p className="text-4xl font-light text-foreground">{brl(produto.preco)}</p>
            <p className="mt-1 text-success">
              em {produto.parcelas}x {brl(produto.preco / produto.parcelas)} sem juros
            </p>

            <p className="mt-4 flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-success" />
              {produto.freteGratis ? (
                <span className="font-medium text-success">Frete grátis para todo o Brasil</span>
              ) : (
                <span className="text-muted-foreground">Frete calculado no checkout</span>
              )}
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  addToCart(produto.id);
                  navigate({ to: "/carrinho" });
                }}
                className="w-full rounded-md bg-brand py-3 font-medium text-gold transition-colors hover:bg-brand-soft"
              >
                Comprar agora
              </button>
              <button
                onClick={() => addToCart(produto.id)}
                className="w-full rounded-md border border-gold bg-gold/10 py-3 font-medium text-gold-deep transition-colors hover:bg-gold/20"
              >
                Adicionar ao carrinho
              </button>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-gold-deep" /> Devolução grátis em 7 dias
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-deep" /> Garantia de 12 meses
              </li>
            </ul>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Descrição</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {produto.descricao}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Quem viu também comprou</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {relacionados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
