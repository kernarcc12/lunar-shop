import { Percent, Zap, Gamepad2 } from "lucide-react";

const promos = [
  {
    id: 1,
    tag: "GANHE RECOMPENSAS",
    title: "Preço Super Baixo",
    subtitle: "Ganhe 20% de volta em recompensas",
    cta: "Comprar Agora",
    icon: Percent,
    gradient: "from-navy to-navy-deep",
  },
  {
    id: 2,
    tag: "MAIS VENDIDO",
    title: "Carregador Power Bank 10000mah",
    subtitle: "A partir de",
    price: "R$ 79,99",
    icon: Zap,
    gradient: "from-navy/80 to-navy-deep",
  },
  {
    id: 3,
    tag: "DESCONTO",
    title: "Controle para Switch/OLED",
    subtitle: "",
    discount: "30% Off",
    icon: Gamepad2,
    gradient: "from-navy/60 to-navy-deep",
  },
];

export function PromoStrip() {
  return (
    <section className="bg-white py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="relative flex items-center overflow-hidden rounded-lg bg-gold-light transition-shadow hover:shadow-md"
            >
              <div className="flex-1 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                  {promo.tag}
                </p>
                <p className="mt-1 text-base font-bold text-navy-deep">{promo.title}</p>
                {promo.subtitle && <p className="text-xs text-navy/60">{promo.subtitle}</p>}
                {promo.price && (
                  <p className="mt-1 text-xl font-bold text-gold-deep">{promo.price}</p>
                )}
                {promo.discount && (
                  <p className="mt-1 text-xl font-bold text-orange">{promo.discount}</p>
                )}
                {promo.cta && (
                  <a
                    href="#"
                    className="mt-3 inline-flex items-center gap-1 rounded-md bg-navy px-3 py-1.5 text-[10px] font-semibold text-gold hover:bg-navy-deep"
                  >
                    {promo.cta} &rarr;
                  </a>
                )}
              </div>
              <div className="flex h-28 w-28 shrink-0 items-center justify-center">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${promo.gradient}`}
                >
                  <promo.icon className="h-8 w-8 text-gold/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
