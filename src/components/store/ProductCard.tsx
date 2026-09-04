import { Link } from "@tanstack/react-router";
import { Star, Truck, MessageCircle, Pencil } from "lucide-react";
import { brl, type Product } from "@/data/products";
import { useAuth } from "@/lib/auth";

const WHATSAPP_NUMBER = "5587996233203";

function buildWhatsAppLink(product: Product): string {
  const priceFormatted = product.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const message = `Olá! Vim pelo site e quero comprar:\n\n*${product.nome}*\nPreço: ${priceFormatted}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const desconto = product.precoAntigo
    ? Math.round((1 - product.preco / product.precoAntigo) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Link to="/produto/$id" params={{ id: product.id }} className="flex flex-1 flex-col">
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
      <div className="px-4 pb-4 space-y-2">
        <a
          href={buildWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-green-500 py-2 text-xs font-medium text-white transition-colors hover:bg-green-600"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Comprar pelo WhatsApp
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
