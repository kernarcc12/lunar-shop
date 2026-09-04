import { Instagram, Phone, MessageCircle, ShieldCheck, CreditCard, Truck } from "lucide-react";

const WHATSAPP_NUMBER = "5587996233203";
const PHONE_NUMBER = "87996233203";

export function Footer() {
  return (
    <footer className="mt-12 bg-brand text-brand-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-lg tracking-[0.25em] text-gold">LUNAR PRODUTOS</p>
          <p className="mt-2 max-w-sm text-sm text-brand-foreground/70">
            Loja. Variedades. Tecnologia. Fragrâncias. Entrega para todo o Brasil com pagamento
            seguro.
          </p>
        </div>
        <div className="space-y-2 text-sm text-brand-foreground/80">
          <p className="font-medium text-brand-foreground">Atendimento</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gold transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-gold" /> (87) 99623-3203
          </a>
          <a
            href={`tel:+55${PHONE_NUMBER}`}
            className="flex items-center gap-2 hover:text-gold transition-colors"
          >
            <Phone className="h-4 w-4 text-gold" /> Ligар
          </a>
          <a
            href="https://www.instagram.com/luna.ressence"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gold transition-colors"
          >
            <Instagram className="h-4 w-4 text-gold" /> @luna.ressence
          </a>
        </div>
        <div className="space-y-2 text-sm text-brand-foreground/80">
          <p className="font-medium text-brand-foreground">Compra garantida</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" /> Site seguro
          </p>
          <p className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gold" /> Pix e cartão em até 12x
          </p>
          <p className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gold" /> Envio em até 24h
          </p>
        </div>
      </div>
      <div className="border-t border-brand-foreground/10 py-4 text-center text-xs text-brand-foreground/50">
        © {new Date().getFullYear()} Lunar Produtos — Todos os direitos reservados
      </div>
    </footer>
  );
}
