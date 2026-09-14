import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import { Slideshow } from "@/components/store/Slideshow";
import { CategoryBar } from "@/components/store/CategoryBar";
import { FeaturedDeals } from "@/components/store/FeaturedDeals";
import { TrendingSection } from "@/components/store/TrendingSection";
import { categorias, type Product } from "@/data/products";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunar Produtos | Curadoria de Produtos pelo Instagram" },
      {
        name: "description",
        content:
          "Produtos selecionados com os melhores preços. Compre pelo Instagram e receba em todo o Brasil.",
      },
      { property: "og:title", content: "Lunar Produtos | Curadoria de Produtos" },
      {
        property: "og:description",
        content: "Curadoria de produtos com os melhores preços. Compre pelo nosso Instagram.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos", "catalogo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("produtos")
        .select("*")
        .order("criado_em", { ascending: false });
      return (data ?? []) as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const ofertas = produtos.filter((p: Product) => p.precoAntigo);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Slideshow />

      <CategoryBar />

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Carregando produtos...</div>
      ) : (
        <>
          {ofertas.length > 0 && <FeaturedDeals products={ofertas} />}

          {produtos.length > 0 && <TrendingSection products={produtos} />}

          {categorias.map((cat) => {
            const lista = produtos.filter((p: Product) => p.categoria === cat);
            if (!lista.length) return null;
            return (
              <section
                key={cat}
                id={cat.toLowerCase().replace(/\W+/g, "-")}
                className="bg-white py-8"
              >
                <div className="mx-auto max-w-7xl px-4">
                  <h2 className="mb-6 text-xl font-bold text-foreground md:text-2xl">{cat}</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {lista.map((p: Product) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      <Footer />
    </div>
  );
}
