import { Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-navy-deep via-navy to-navy-deep py-16">
      <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
        <div className="flex h-full items-center justify-center gap-4">
          <div className="h-40 w-40 rounded-lg bg-gold/20" />
          <div className="h-60 w-60 rounded-lg bg-gold/10" />
        </div>
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-gold/60">
              NEW COLLECTION
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-5xl">
              Up to <span className="text-gold">30% Off</span>
            </h2>
            <p className="mt-1 text-xl font-bold text-white">Instant Discount</p>
            <p className="mt-1 text-sm text-white/60">
              Aplicável em cartão de crédito. Confira as condições.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form
              className="flex overflow-hidden rounded-md bg-white"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Digite seu e-mail..."
                className="flex-1 px-4 py-3 text-sm text-foreground outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-gold px-6 py-3 text-sm font-semibold text-navy-deep hover:bg-gold-deep"
              >
                <Mail className="h-4 w-4" />
                Inscrever
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
