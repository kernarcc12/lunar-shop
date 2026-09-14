export function PromoBanners() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-lg bg-gold-light p-6 transition-shadow hover:shadow-md">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                GANHE RECOMPENSAS
              </p>
              <h3 className="mt-1 text-xl font-bold text-navy-deep">
                Economia de <span className="text-orange">50% Off</span>
              </h3>
              <p className="mt-1 text-xs text-navy/60">Melhor preço do mercado</p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1 rounded-md bg-navy px-4 py-2 text-xs font-semibold text-gold hover:bg-navy-deep"
              >
                Comprar Agora &rarr;
              </a>
            </div>
            <div className="absolute right-0 top-0 flex h-full w-1/2 items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gold/40 to-gold-deep/40" />
            </div>
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-lg bg-navy p-6 transition-shadow hover:shadow-md">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold/60">
                NOVIDADES
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">Fone B&O Beoplay EB 3.0</h3>
              <p className="mt-1 text-xs text-white/60">Frete grátis em compras acima de R$ 300</p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1 rounded-md bg-gold px-4 py-2 text-xs font-semibold text-navy-deep hover:bg-gold-deep"
              >
                Comprar Agora &rarr;
              </a>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="flex gap-1">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gold/30 to-gold-deep/30" />
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gold/20 to-gold-deep/20" />
              </div>
            </div>
          </div>

          {/* Banner 3 */}
          <div className="relative overflow-hidden rounded-lg bg-gold-light p-6 transition-shadow hover:shadow-md">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-deep">
                MAIS VENDIDO
              </p>
              <h3 className="mt-1 text-xl font-bold text-navy-deep">Beleza no seu pulso</h3>
              <p className="mt-1 text-xs text-navy/60">Compre 1 e ganhe 1 grátis em acessórios</p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1 rounded-md bg-navy px-4 py-2 text-xs font-semibold text-gold hover:bg-navy-deep"
              >
                Comprar Agora &rarr;
              </a>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="h-20 w-20 rounded-full border-4 border-navy/80 bg-gradient-to-br from-navy/60 to-navy-deep/80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
