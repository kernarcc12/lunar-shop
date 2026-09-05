import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Truck, CreditCard, Sparkles } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import { categorias, type Product } from "@/data/products";
import { supabase } from "@/lib/supabase";

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
        content:
          "Tecnologia, fragrâncias e acessórios com preços de oferta e envio para todo o Brasil.",
      },
    ],
  }),
  component: Home,
});

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function Home() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    async function fetchProdutos() {
      const { data } = await supabase
        .from("produtos")
        .select("*")
        .order("criado_em", { ascending: false });
      if (data) setProdutos(data);
    }
    fetchProdutos();
  }, []);

  useEffect(() => {
    const targetDate = new Date("2026-09-27T00:00:00");

    function calculateTimeLeft(): TimeLeft {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setShowCountdown(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const ofertas = produtos.filter((p) => p.precoAntigo);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-black">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 md:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
              <Sparkles className="h-4 w-4" /> NOVIDADES LUNAR
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-brand-foreground md:text-5xl">
              Tecnologia e variedades para você
            </h1>
            <p className="mt-3 max-w-md text-sm text-brand-foreground/70">
              Produtos selecionados, novidades e ofertas especiais em um só lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-brand-foreground/80">
            {[
              { icon: Truck, t: "Enviamos para você", d: "Consulte as opções de entrega" },
              {
                icon: CreditCard,
                t: "Facilidade no pagamento",
                d: "Escolha a melhor forma para você",
              },
              {
                icon: ShieldCheck,
                t: "Produtos selecionados",
                d: "Qualidade e variedade em um só lugar",
              },
              {
                icon: Sparkles,
                t: "Sempre tem novidade",
                d: "Acompanhe nossas novidades no Instagram",
              },
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
        {showCountdown ? (
          <section className="flex flex-col items-center justify-center py-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Em breve!</h2>
            <p className="mb-8 text-muted-foreground">Estamos preparando algo especial para você</p>

            <div className="countdown-container flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="countdown-block countdown-blue">
                <span className="countdown-label">DAYS</span>
                <span className="countdown-value">{pad(timeLeft.days)}</span>
              </div>
              <div className="countdown-block countdown-green">
                <span className="countdown-label">HOURS</span>
                <span className="countdown-value">{pad(timeLeft.hours)}</span>
              </div>
              <div className="countdown-block countdown-blue">
                <span className="countdown-label">MINUTES</span>
                <span className="countdown-value">{pad(timeLeft.minutes)}</span>
              </div>
              <div className="countdown-block countdown-green">
                <span className="countdown-label">SECONDS</span>
                <span className="countdown-value">{pad(timeLeft.seconds)}</span>
              </div>
            </div>
          </section>
        ) : (
          <>
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
