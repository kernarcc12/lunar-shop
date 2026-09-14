import { useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";

const tabs = [
  { id: "best-seller", label: "Mais Vendidos" },
  { id: "sales", label: "Ofertas" },
  { id: "featured", label: "Destaques" },
  { id: "new", label: "Novidades" },
  { id: "all", label: "Ver Todos" },
];

interface TrendingSectionProps {
  products: Product[];
}

export function TrendingSection({ products }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState("best-seller");

  if (!products.length) return null;

  const featured = products[0];
  const gridProducts = products.slice(1, 9);

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            Mais Vendidos no Instagram
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-navy text-gold"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="grid grid-cols-2 gap-4">
            {gridProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {featured && (
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm">
                <ProductCard product={featured} featured />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {gridProducts.slice(4, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
