import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, MapPin, Menu, PackagePlus, LogIn, LogOut, User } from "lucide-react";
import logo from "@/assets/icone.png";
import { categorias } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function Header() {
  const items = useCart();
  const total = items.reduce((s, i) => s + i.qtd, 0);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Lunar Produtos"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
            <span className="font-display text-lg leading-none tracking-[0.2em] text-gold">
              LUNAR
              <span className="block text-[10px] tracking-[0.35em] text-brand-foreground/70">
                PRODUTOS
              </span>
            </span>
          </Link>

          <form
            className="order-3 flex w-full items-center overflow-hidden rounded-md bg-background md:order-2 md:w-auto md:flex-1"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              placeholder="Buscar produtos, marcas e muito mais..."
              className="w-full bg-transparent px-4 py-2.5 text-sm text-foreground outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="px-4 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="order-2 ml-auto flex items-center gap-4 md:order-3 md:ml-0">
            <span className="hidden items-center gap-1 text-xs text-brand-foreground/80 lg:flex">
              <MapPin className="h-4 w-4 text-gold" />
              Enviar para todo o Brasil
            </span>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-1.5 text-xs text-brand-foreground/80 md:flex">
                  <User className="h-4 w-4 text-gold" />
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-sm font-medium text-brand-foreground/80 hover:text-gold"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-brand-foreground/80 hover:text-gold"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden md:inline">Entrar</span>
              </Link>
            )}

            <Link
              to="/carrinho"
              className="relative flex items-center gap-2 text-sm font-medium hover:text-gold"
            >
              <ShoppingCart className="h-6 w-6" />
              {total > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-brand">
                  {total}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-sm text-muted-foreground">
          <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
            <Menu className="h-4 w-4" /> Categorias
          </span>
          {categorias.map((c) => (
            <Link
              key={c}
              to="/"
              hash={c.toLowerCase().replace(/\W+/g, "-")}
              className="shrink-0 hover:text-foreground"
            >
              {c}
            </Link>
          ))}
          <span className="shrink-0 font-medium text-gold-deep">Ofertas do dia</span>
          {user && (
            <Link
              to="/cadastrar-produto"
              className="ml-auto flex shrink-0 items-center gap-1 font-medium text-gold-deep hover:text-gold"
            >
              <PackagePlus className="h-4 w-4" /> Cadastrar produto
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
