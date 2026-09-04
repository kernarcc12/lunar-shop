import { Link } from "@tanstack/react-router";
import { Star, Truck } from "lucide-react";
import { brl, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const desconto = product.precoAntigo
    ? Math.round((1 - product.preco / product.precoAntigo) * 100)
    : 0;

  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square bg-white p-4">
        <img
          src={product.imagem}
          alt={product.nome}
          width={800}
          height={800}
          loading="lazy"
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
        />
        {desconto > 0 && (
          <span className="absolute left-3 top-3 rounded bg-gold px-2 py-0.5 text-xs font-bold text-brand">
            -{desconto}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm text-foreground">{product.nome}</h3>
        {product.precoAntigo && (
          <span className="text-xs text-muted-foreground line-through">
            {brl(product.precoAntigo)}
          </span>
        )}
        <p className="text-xl font-semibold text-foreground">{brl(product.preco)}</p>
        <p className="text-xs text-success">
          em {product.parcelas}x {brl(product.preco / product.parcelas)} sem juros
        </p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {product.avaliacao.toFixed(1)}
          </span>
          {product.freteGratis && (
            <span className="flex items-center gap-1 font-medium text-success">
              <Truck className="h-3.5 w-3.5" /> Frete grátis
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
