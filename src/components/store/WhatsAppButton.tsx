import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5587996233203";

function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

interface WhatsAppButtonProps {
  productName: string;
  productPrice: number;
  productUrl?: string;
  className?: string;
  variant?: "default" | "small";
}

export function WhatsAppButton({
  productName,
  productPrice,
  productUrl,
  className = "",
  variant = "default",
}: WhatsAppButtonProps) {
  const priceFormatted = productPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const message = productUrl
    ? `Olá! Vim pelo site e quero comprar:\n\n*${productName}*\nPreço: ${priceFormatted}\n\n${productUrl}`
    : `Olá! Vim pelo site e quero comprar:\n\n*${productName}*\nPreço: ${priceFormatted}`;

  const href = buildWhatsAppLink(message);

  if (variant === "small") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 ${className}`}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2 rounded-md bg-green-500 py-3 font-medium text-white transition-colors hover:bg-green-600 ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      Comprar pelo WhatsApp
    </a>
  );
}
