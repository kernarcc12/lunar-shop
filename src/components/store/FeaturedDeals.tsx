import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface FeaturedDealsProps {
  products: Product[];
}

export function FeaturedDeals({ products }: FeaturedDealsProps) {
  const [targetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 0);
    return d;
  });

  const timeLeft = useCountdown(targetDate);

  if (!products.length) return null;

  return (
    <section id="ofertas" className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            Ofertas por Tempo Limitado
          </h2>
          <div className="countdown-container">
            <span className="text-sm font-medium text-muted-foreground">Encerra em:</span>
            <div className="flex items-center gap-1">
              <div className="countdown-block">
                <span className="countdown-value">{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="countdown-label">Dias</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-block">
                <span className="countdown-value">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="countdown-label">Horas</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-block">
                <span className="countdown-value">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="countdown-label">Min</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-block">
                <span className="countdown-value">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="countdown-label">Seg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 5).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
