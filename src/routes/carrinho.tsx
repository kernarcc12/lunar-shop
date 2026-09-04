import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { brl, getProduto } from "@/data/products";
import { clearCart, removeFromCart, setQty, useCart } from "@/lib/cart";

const WHATSAPP_NUMBER = "5587996233203";

function buildCartWhatsAppLink(items: { produto: { nome: string; preco: number }; qtd: number }[]) {
  const lines = items.map(
    (i) => `• ${i.produto.nome} (x${i.qtd}) - ${brl(i.produto.preco * i.qtd)}`,
  );
  const total = items.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
  const message = `Olá! Vim pelo site e quero fazer um pedido:\n\n${lines.join("\n")}\n\n*Total: ${brl(total)}*\n\nAguardo confirmação!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho de compras | Lunar Produtos" },
      {
        name: "description",
        content: "Revise os itens do seu carrinho e finalize a compra na Lunar Produtos.",
      },
      { property: "og:title", content: "Carrinho | Lunar Produtos" },
      {
        property: "og:description",
        content: "Finalize sua compra com pagamento seguro e entrega rápida.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const items = useCart();
  const [pedidoFeito, setPedidoFeito] = useState(false);

  const linhas = items
    .map((i) => ({ item: i, produto: getProduto(i.id) }))
    .filter((l) => l.produto);
  const total = linhas.reduce((s, l) => s + l.produto!.preco * l.item.qtd, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Seu carrinho</h1>

        {pedidoFeito ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-4 font-display text-2xl text-gold-deep">Pedido enviado!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu pedido foi enviado pelo WhatsApp. Aguarde a confirmação do vendedor.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-brand px-6 py-3 font-medium text-gold"
            >
              Continuar comprando
            </Link>
          </div>
        ) : linhas.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Seu carrinho está vazio.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-brand px-6 py-3 font-medium text-gold"
            >
              Ver ofertas
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {linhas.map(({ item, produto }) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <img
                    src={produto!.imagem}
                    alt={produto!.nome}
                    width={800}
                    height={800}
                    loading="lazy"
                    className="h-24 w-24 rounded bg-white object-contain p-2"
                  />
                  <div className="flex-1">
                    <Link
                      to="/produto/$id"
                      params={{ id: produto!.id }}
                      className="line-clamp-2 text-sm text-foreground hover:underline"
                    >
                      {produto!.nome}
                    </Link>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {brl(produto!.preco * item.qtd)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded border border-border">
                        <button
                          aria-label="Diminuir"
                          className="px-3 py-1 text-muted-foreground hover:text-foreground"
                          onClick={() => setQty(item.id, item.qtd - 1)}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.qtd}</span>
                        <button
                          aria-label="Aumentar"
                          className="px-3 py-1 text-muted-foreground hover:text-foreground"
                          onClick={() => setQty(item.id, item.qtd + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">Resumo da compra</h2>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Produtos</span>
                <span>{brl(total)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>Frete</span>
                <span className="text-success">Grátis</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold text-foreground">
                <span>Total</span>
                <span>{brl(total)}</span>
              </div>
              <p className="mt-1 text-sm text-success">em 12x {brl(total / 12)} sem juros</p>
              <button
                onClick={() => {
                  const whatsappUrl = buildCartWhatsAppLink(
                    linhas.map((l) => ({ produto: l.produto!, qtd: l.item.qtd })),
                  );
                  window.open(whatsappUrl, "_blank");
                  clearCart();
                  setPedidoFeito(true);
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-green-500 py-3 font-medium text-white hover:bg-green-600"
              >
                <MessageCircle className="h-5 w-5" />
                Finalizar compra pelo WhatsApp
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
