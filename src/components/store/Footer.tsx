import { Link } from "@tanstack/react-router";
import {
  Instagram,
  Phone,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Truck,
  Mail,
  MapPin,
  Facebook,
  Twitter,
} from "lucide-react";
import { categorias } from "@/data/products";

const WHATSAPP_NUMBER = "5587996233203";
const PHONE_NUMBER = "87996233203";
const INSTAGRAM = "luna.ressence";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold tracking-tight text-white">
            Lunar<span className="text-gold">Produtos</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Curadoria de produtos com os melhores preços. Compre pelo nosso Instagram e receba em
            todo o Brasil.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={`https://www.instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-gold hover:text-navy-deep"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-gold hover:text-navy-deep"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-gold hover:text-navy-deep"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gold">Categorias</p>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            {categorias.map((c) => (
              <li key={c}>
                <Link
                  to="/"
                  hash={c.toLowerCase().replace(/\W+/g, "-")}
                  className="hover:text-gold hover:underline"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gold">Links Úteis</p>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>
              <a href="#" className="hover:text-gold hover:underline">
                Sobre Nós
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gold">Contato</p>
          <ul className="mt-3 space-y-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>Todo o Brasil</span>
            </li>
            <li>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-gold" />
                (87) 99623-3203
              </a>
            </li>
            <li>
              <a
                href={`tel:+55${PHONE_NUMBER}`}
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                Ligar
              </a>
            </li>
            <li>
              <a
                href={`https://www.instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Instagram className="h-4 w-4 shrink-0 text-gold" />@{INSTAGRAM}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 text-sm text-white/60">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" /> Compra Segura
          </span>
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gold" /> Pix e Cartão até 12x
          </span>
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gold" /> Envio para todo o Brasil
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} Lunar Produtos — Todos os direitos reservados
      </div>
    </footer>
  );
}
