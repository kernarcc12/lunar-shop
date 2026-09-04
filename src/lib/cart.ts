import { useEffect, useState } from "react";

export type CartItem = { id: string; qtd: number };

const KEY = "lunar-cart";
const EVT = "lunar-cart-change";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function addToCart(id: string, qtd = 1) {
  const items = read();
  const found = items.find((i) => i.id === id);
  if (found) found.qtd += qtd;
  else items.push({ id, qtd });
  write(items);
}

export function setQty(id: string, qtd: number) {
  const items = read()
    .map((i) => (i.id === id ? { ...i, qtd } : i))
    .filter((i) => i.qtd > 0);
  write(items);
}

export function removeFromCart(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}
