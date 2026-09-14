import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Phone,
  PackagePlus,
  LogIn,
  LogOut,
  LayoutPanelLeft,
  Image,
  ChevronDown,
  Store,
  MapPin,
} from "lucide-react";
import logo from "@/assets/icone.png";
import { categorias } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function Header() {
  const items = useCart();
  const total = items.reduce((s, i) => s + i.qtd, 0);
  const { user, signOut, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Top Bar */}
      <div className="border-b border-border bg-navy-deep text-[11px] text-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1 hover:text-gold">
              <Store className="h-3 w-3" />
              <span>Encontrar Loja</span>
            </Link>
            <Link to="/" className="hover:text-gold">
              Comprar
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-border bg-navy-deep">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src={logo} alt="Lunar Produtos" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-bold tracking-tight text-white">
              Lunar<span className="text-gold">Produtos</span>
            </span>
          </Link>

          {/* Search in header */}
          <form
            className="hidden flex-1 items-center overflow-hidden rounded-md border border-white/10 bg-white/5 lg:flex"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatDropdown(!catDropdown)}
                className="flex items-center gap-1 border-r border-white/10 px-3 py-2.5 text-xs font-medium text-white/80 hover:bg-white/5"
              >
                Todas Categorias
                <ChevronDown className="h-3 w-3" />
              </button>
              {catDropdown && (
                <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-white shadow-lg">
                  {categorias.map((c) => (
                    <Link
                      key={c}
                      to="/"
                      hash={c.toLowerCase().replace(/\W+/g, "-")}
                      className="block px-3 py-2 text-xs text-foreground hover:bg-gold-light hover:text-navy"
                      onClick={() => setCatDropdown(false)}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <input
              type="search"
              placeholder="Pesquisar produtos..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="bg-gold px-5 py-2.5 text-navy-deep hover:bg-gold-deep"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right icons */}
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden items-center gap-1.5 text-xs font-medium text-white/60 lg:flex">
              <Phone className="h-4 w-4 text-gold" />
              (87) 99623-3203
            </span>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1 text-xs text-white/60 xl:flex">
                  <User className="h-4 w-4" />
                </span>
                <button
                  onClick={() => signOut()}
                  className="rounded-md p-1.5 text-white/60 hover:text-gold"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-md p-1.5 text-white/60 hover:text-gold">
                <User className="h-5 w-5" />
              </Link>
            )}

            <Link to="/" className="rounded-md p-1.5 text-white/60 hover:text-gold">
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/carrinho"
              className="relative flex items-center gap-2 rounded-md p-1.5 text-white/60 hover:text-gold"
            >
              <ShoppingCart className="h-5 w-5" />
              {total > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy-deep">
                  {total}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-navy">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
          {/* Shop By Department */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy-deep hover:bg-gold-deep"
            >
              <Menu className="h-4 w-4" />
              Ver por Departamento
              <ChevronDown className="h-3 w-3" />
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border border-border bg-white shadow-lg">
                {categorias.map((c) => (
                  <Link
                    key={c}
                    to="/"
                    hash={c.toLowerCase().replace(/\W+/g, "-")}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-gold-light hover:text-navy"
                    onClick={() => setMenuOpen(false)}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search in nav */}
          <form
            className="flex flex-1 items-center overflow-hidden rounded-md bg-white/10 lg:hidden"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              placeholder="Pesquisar produtos..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="bg-gold px-4 py-2.5 text-navy-deep"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right links */}
          <div className="ml-auto flex items-center gap-5 text-[13px] font-medium text-white/70">
            <Link to="/" className="hidden hover:text-gold md:inline">
              Visitados Recentemente
            </Link>
            <Link to="/" className="hidden hover:text-gold md:inline">
              Status do Pedido
            </Link>
          </div>

          {/* Admin Links */}
          <div className="flex items-center gap-2">
            <Link to="/flyers" className="rounded-md p-1.5 text-white/50 hover:text-gold">
              <Image className="h-4 w-4" />
            </Link>
            {user && (
              <Link
                to="/cadastrar-produto"
                className="rounded-md p-1.5 text-white/50 hover:text-gold"
              >
                <PackagePlus className="h-4 w-4" />
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="rounded-md p-1.5 text-white/50 hover:text-gold">
                <LayoutPanelLeft className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
