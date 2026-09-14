import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Image } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { supabase } from "@/lib/supabase";

type Flyer = {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  link: string;
  tipo: "estatico" | "animado";
  ativo: boolean;
  ordem: number;
  criado_em: string;
};

export const Route = createFileRoute("/flyers")({
  head: () => ({
    meta: [
      { title: "Flyers & Ofertas | Lunar Produtos" },
      {
        name: "description",
        content: "Confira nossos flyers e ofertas especiais da Lunar Produtos.",
      },
    ],
  }),
  component: FlyersPage,
});

function FlyersPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlyers();
  }, []);

  async function fetchFlyers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("flyers")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (!error && data) {
      setFlyers(data);
    }
    setLoading(false);
  }

  const flyersEstaticos = flyers.filter((f) => f.tipo === "estatico");
  const flyersAnimados = flyers.filter((f) => f.tipo === "animado");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative overflow-hidden bg-brand py-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.78_0.14_75/0.12),transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-4">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/70"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar à loja
            </Link>
            <div className="text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight text-gold sm:text-5xl lg:text-6xl">
                Flyers & Promoções
              </h1>
              <p className="mt-3 max-w-md mx-auto text-sm text-white/50 sm:text-base">
                Confira nossas ofertas exclusivas e promoções imperdíveis
              </p>
            </div>
          </div>
        </section>

        <section className="bg-brand py-8 sm:py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-gold" />
              <p className="mt-4 text-sm text-white/40">Carregando ofertas...</p>
            </div>
          ) : flyers.length === 0 ? (
            <div className="mx-auto max-w-md px-4 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                <Image className="h-6 w-6 text-white/30" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white/80">Nenhum flyer disponível</h2>
              <p className="mt-2 text-sm text-white/40">
                Em breve teremos novas promoções para você!
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand transition-all hover:bg-gold-deep"
              >
                Ver produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {flyersAnimados.length > 0 && (
                <section>
                  <div className="mb-5 px-4">
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold">
                      Destaques Animados
                    </p>
                  </div>
                  <AutoScrollCarousel flyers={flyersAnimados} />
                </section>
              )}

              {flyersEstaticos.length > 0 && (
                <section>
                  <div className="mb-5 px-4">
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold">
                      Promoções
                    </p>
                  </div>
                  <AutoScrollCarousel flyers={flyersEstaticos} />
                </section>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function AutoScrollCarousel({ flyers }: { flyers: Flyer[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="group/scroll relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover/scroll:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover/scroll:opacity-100"
      >
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="flex justify-center">
        <div
          ref={scrollRef}
          className="scrollbar-none flex gap-[5px] overflow-x-auto scroll-smooth px-4 pb-2"
        >
          {flyers.map((flyer) => (
            <FlyerCard key={flyer.id} flyer={flyer} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlyerCard({ flyer }: { flyer: Flyer }) {
  const hasLink = !!flyer.link;

  const content = (
    <div className="group relative h-[427px] w-[230px] flex-none overflow-hidden rounded-lg">
      <img
        src={flyer.imagem}
        alt={flyer.titulo || "Flyer"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {hasLink && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      {hasLink && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
            Ver oferta
          </div>
        </div>
      )}
    </div>
  );

  if (!hasLink) return content;

  if (flyer.link.startsWith("http")) {
    return (
      <a href={flyer.link} target="_blank" rel="noopener noreferrer" className="block flex-none">
        {content}
      </a>
    );
  }

  return (
    <Link to={flyer.link} className="block flex-none">
      {content}
    </Link>
  );
}
