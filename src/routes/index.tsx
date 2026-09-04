import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Truck, CreditCard, Sparkles } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import { categorias, produtos } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunar Produtos | Tecnologia, Fragrâncias e Variedades" },
      {
        name: "description",
        content:
          "Compre eletrônicos, perfumes e itens para casa na Lunar Produtos. Ofertas com frete grátis, parcelamento em até 12x e entrega rápida.",
      },
      { property: "og:title", content: "Lunar Produtos | Loja online de variedades" },
      {
        property: "og:description",
        content: "Tecnologia, fragrâncias e acessórios com preços de oferta e envio para todo o Brasil.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const ofertas = produtos.filter((p) => p.precoAntigo);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-brand">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 md:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
              <Sparkles className="h-4 w-4" /> Semana lunar
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-brand-foreground md:text-5xl">
              Até <span className="text-gold">40% OFF</span> em tecnologia e fragrâncias
            </h1>
            <p className="mt-3 max-w-md text-sm text-brand-foreground/70">
              Parcele em até 12x sem juros e receba em casa com frete grátis nos produtos
              selecionados.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-brand-foreground/80">
            {[
              { icon: Truck, t: "Frete grátis", d: "em produtos selecionados" },
              { icon: CreditCard, t: "Até 12x", d: "sem juros no cartão" },
              { icon: ShieldCheck, t: "Compra segura", d: "garantia de 12 meses" },
              { icon: Sparkles, t: "Novidades", d: "toda semana na loja" },
            ].map((b) => (
              <div key={b.t} className="rounded-lg border border-gold/20 bg-brand-soft p-4">
                <b.icon className="h-5 w-5 text-gold" />
                <p className="mt-2 font-medium text-brand-foreground">{b.t}</p>
                <p className="text-xs">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold text-foreground">Ofertas do dia</h2>
            <span className="text-sm text-gold-deep">Promoções por tempo limitado</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {ofertas.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {categorias.map((cat) => {
          const lista = produtos.filter((p) => p.categoria === cat);
          if (!lista.length) return null;
          return (
            <section key={cat} id={cat.toLowerCase().replace(/\W+/g, "-")} className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-foreground">{cat}</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {lista.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
