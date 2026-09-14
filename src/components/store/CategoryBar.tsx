import { Link } from "@tanstack/react-router";
import { ShoppingBag, Palette, Fish, Sparkles, Cpu } from "lucide-react";

const categoryIcons: Record<string, { icon: React.ElementType; label: string }> = {
  Acessórios: { icon: ShoppingBag, label: "Acessórios" },
  Artesanato: { icon: Palette, label: "Artesanato" },
  "Caça & Pesca": { icon: Fish, label: "Caça & Pesca" },
  Cosméticos: { icon: Sparkles, label: "Cosméticos" },
  Tecnologia: { icon: Cpu, label: "Tecnologia" },
};

export function CategoryBar() {
  return (
    <section className="border-b border-border bg-white py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-none md:gap-8 lg:gap-10">
          {Object.entries(categoryIcons).map(([key, { icon: Icon, label }]) => (
            <Link
              key={key}
              to="/"
              hash={key.toLowerCase().replace(/\W+/g, "-")}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-light bg-gold-light text-gold transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-navy-deep lg:h-20 lg:w-20">
                <Icon className="h-7 w-7 lg:h-8 lg:w-8" />
              </div>
              <span className="text-center text-xs font-medium text-foreground lg:text-sm">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
