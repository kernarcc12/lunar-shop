import { Link } from "@tanstack/react-router";
import { Star, Truck, MessageCircle, Heart, Pencil, Boxes } from "lucide-react";
import { brl, type Product } from "@/data/products";
import { useAuth } from "@/lib/auth";

function buildInstagramLink(product: Product): string {
  const priceFormatted = product.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const message = `Olá! Vim pelo site e quero comprar:\n\n*${product.nome}*\nPreço: ${priceFormatted}`;
  return `https://wa.me/5587996233203?text=${encodeURIComponent(message)}`;
}

export function ProductCard({ product, featured }: { product: Product; featured?: boolean }) {
  const { user } = useAuth();
  const desconto = product.precoAntigo
    ? Math.round((1 - product.preco / product.precoAntigo) * 100)
    : 0;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg ${featured ? "p-2" : ""}`}
    >
      <Link to="/produto/$id" params={{ id: product.id }} className="flex flex-1 flex-col">
        <div
          className={`relative bg-background p-4 ${featured ? "aspect-[4/3]" : "aspect-square"}`}
        >
          <img
            src={product.imagem}
            alt={product.nome}
            width={800}
            height={800}
            loading="lazy"
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
          />
          {desconto > 0 && (
            <span className="absolute left-3 top-3 rounded bg-gold px-2 py-0.5 text-xs font-bold text-navy-deep">
              -{desconto}%
            </span>
          )}
          <button
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground opacity-0 transition-all hover:border-gold hover:text-gold group-hover:opacity-100"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.categoria}
          </p>
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.nome}</h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">{brl(product.preco)}</span>
            {product.precoAntigo && (
              <span className="text-xs text-muted-foreground line-through">
                {brl(product.precoAntigo)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            em {product.parcelas}x {brl(product.preco / product.parcelas)} sem juros
          </p>
          {product.quantidade > 0 ? (
            <p className="flex items-center gap-1 text-[10px] font-medium text-success">
              <Boxes className="h-3.5 w-3.5" />
              {product.quantidade} em estoque
            </p>
          ) : (
            <p className="text-[10px] font-medium text-destructive">Esgotado</p>
          )}
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
      <div className="space-y-2 px-4 pb-4">
        <a
          href={buildInstagramLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-navy py-2 text-xs font-medium text-gold transition-colors hover:bg-navy-deep"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Comprar
        </a>
        {user && (
          <Link
            to="/editar-produto/$id"
            params={{ id: product.id }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar produto
          </Link>
        )}
      </div>
    </div>
  );
}
