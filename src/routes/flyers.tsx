import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Film, Image, ExternalLink, Sparkles } from "lucide-react";
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
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);

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

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-gold">
            <Sparkles className="h-4 w-4" />
            Ofertas Especiais
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Flyers & Promoções
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Confira nossas ofertas exclusivas e promoções imperdíveis
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Carregando flyers...</p>
          </div>
        ) : flyers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <Image className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              Nenhum flyer disponível
            </h2>
            <p className="mt-2 text-muted-foreground">
              Em breve teremos novas promoções e ofertas especiais para você!
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {flyersAnimados.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Film className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Destaques Animados</h2>
                    <p className="text-sm text-muted-foreground">Ofertas com mais vida</p>
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {flyersAnimados.map((flyer) => (
                    <FlyerCard
                      key={flyer.id}
                      flyer={flyer}
                      onClick={() => setSelectedFlyer(flyer)}
                    />
                  ))}
                </div>
              </section>
            )}

            {flyersEstaticos.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Promoções</h2>
                    <p className="text-sm text-muted-foreground">Ofertas estáticas</p>
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {flyersEstaticos.map((flyer) => (
                    <FlyerCard
                      key={flyer.id}
                      flyer={flyer}
                      onClick={() => setSelectedFlyer(flyer)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {selectedFlyer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedFlyer(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFlyer(null)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              ✕
            </button>
            <img
              src={selectedFlyer.imagem}
              alt={selectedFlyer.titulo || "Flyer"}
              className="w-full object-contain"
            />
            {(selectedFlyer.titulo || selectedFlyer.descricao) && (
              <div className="p-6">
                {selectedFlyer.titulo && (
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedFlyer.titulo}
                  </h3>
                )}
                {selectedFlyer.descricao && (
                  <p className="mt-2 text-muted-foreground">{selectedFlyer.descricao}</p>
                )}
                {selectedFlyer.link && (
                  selectedFlyer.link.startsWith("http") ? (
                    <a
                      href={selectedFlyer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver oferta
                    </a>
                  ) : (
                    <Link
                      to={selectedFlyer.link}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver oferta
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function FlyerCard({
  flyer,
  onClick,
}: {
  flyer: Flyer;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5"
      onClick={onClick}
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        <img
          src={flyer.imagem}
          alt={flyer.titulo || "Flyer"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {flyer.tipo === "animado" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-purple-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Film className="h-3 w-3" />
            Animado
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-sm font-medium">Clique para ampliar</p>
        </div>
      </div>
      {(flyer.titulo || flyer.descricao) && (
        <div className="p-4">
          {flyer.titulo && (
            <h3 className="font-semibold text-foreground">{flyer.titulo}</h3>
          )}
          {flyer.descricao && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {flyer.descricao}
            </p>
          )}
          {flyer.link && (
            <div className="mt-3 flex items-center gap-1 text-sm font-medium text-gold-deep">
              <ExternalLink className="h-3.5 w-3.5" />
              Ver oferta
            </div>
          )}
        </div>
      )}
    </div>
  );
}
