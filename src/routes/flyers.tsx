import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Film, Image, ExternalLink, Sparkles, ChevronRight } from "lucide-react";
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
      { name: "description", content: "Confira nossos flyers e ofertas especiais da Lunar Produtos." },
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
        <section className="relative overflow-hidden bg-brand">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.78_0.14_75/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.60_0.12_70/0.1),transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar à loja
            </Link>
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Ofertas Especiais
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Flyers & Promoções
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/60 sm:text-lg">
                Confira nossas ofertas exclusivas e promoções imperdíveis
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-border" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              </div>
              <p className="mt-5 text-sm font-medium text-muted-foreground">Carregando ofertas...</p>
            </div>
          ) : flyers.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-border bg-card px-8 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Image className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">
                Nenhum flyer disponível
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Em breve teremos novas promoções e ofertas especiais para você!
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-gold shadow-md shadow-brand/30 transition-all hover:bg-brand-soft hover:shadow-lg hover:shadow-brand/40"
              >
                Ver produtos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-14">
              {flyersAnimados.length > 0 && (
                <section>
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                      <Film className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Destaques Animados</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">Ofertas com mais vida</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-5 sm:justify-start">
                    {flyersAnimados.map((flyer, i) => (
                      <FlyerCard key={flyer.id} flyer={flyer} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {flyersEstaticos.length > 0 && (
                <section>
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
                      <Image className="h-5 w-5 text-brand-foreground/70" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Promoções</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">Ofertas estáticas</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-5 sm:justify-start">
                    {flyersEstaticos.map((flyer, i) => (
                      <FlyerCard key={flyer.id} flyer={flyer} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FlyerCard({ flyer, index }: { flyer: Flyer; index: number }) {
  const hasLink = !!flyer.link;

  const content = (
    <div
      className="group relative w-[230px] overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-[427px] w-[230px] overflow-hidden bg-muted">
        <img
          src={flyer.imagem}
          alt={flyer.titulo || "Flyer"}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {flyer.tipo === "animado" && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-600/30">
            <Film className="h-2.5 w-2.5" />
            Animado
          </div>
        )}

        {hasLink && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
              <ExternalLink className="h-2.5 w-2.5" />
              Ver oferta
            </div>
          </div>
        )}

        {hasLink && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <ExternalLink className="h-3 w-3" />
              Ver oferta
            </div>
          </div>
        )}
      </div>

      {(flyer.titulo || flyer.descricao) && (
        <div className="p-3">
          {flyer.titulo && (
            <h3 className="text-xs font-semibold leading-snug text-foreground line-clamp-1 sm:text-sm">
              {flyer.titulo}
            </h3>
          )}
          {flyer.descricao && (
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
              {flyer.descricao}
            </p>
          )}
          {hasLink && (
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Acessar agora
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!hasLink) return content;

  const wrapperClass = "block outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl";

  if (flyer.link.startsWith("http")) {
    return (
      <a href={flyer.link} target="_blank" rel="noopener noreferrer" className={wrapperClass}>
        {content}
      </a>
    );
  }

  return (
    <Link to={flyer.link} className={wrapperClass}>
      {content}
    </Link>
  );
}
