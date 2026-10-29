export type ProductCategory = "Cervezas" | "Vinos" | "Destilados" | "Aperitivos";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  volume: string;
  price: number;
  image: string;
  badge?: string;
  description: string;
}

/** Productos y precios ilustrativos, editables para esta maqueta. */
export const products: Product[] = [
  {
    id: 1, name: "Fernet Branca", category: "Aperitivos", volume: "750 ml",
    price: 14500, image: "/images/fernet-branca.webp", badge: "CLÁSICO",
    description: "Ideal para compartir en tus juntadas."
  },
  {
    id: 2, name: "Gin Bombay Sapphire", category: "Destilados", volume: "750 ml",
    price: 28900, image: "/images/gin-bombay.webp", badge: "SELECCIÓN",
    description: "Un gin aromático para combinar como más te guste."
  },
  {
    id: 3, name: "Cerveza Corona Extra", category: "Cervezas", volume: "710 ml",
    price: 4900, image: "/images/corona-extra.webp",
    description: "Cerveza refrescante para disfrutar bien fría."
  },
  {
    id: 4, name: "Malbec Trapiche", category: "Vinos", volume: "750 ml",
    price: 7800, image: "/images/malbec-trapiche.webp",
    description: "Un Malbec para acompañar cualquier ocasión."
  },
  {
    id: 5, name: "Aperol Aperitivo", category: "Aperitivos", volume: "750 ml",
    price: 16900, image: "/images/aperol.webp",
    description: "Ideal para preparar un spritz."
  },
  {
    id: 6, name: "Vodka Absolut", category: "Destilados", volume: "700 ml",
    price: 19500, image: "/images/vodka-absolut.webp",
    description: "Vodka versátil para mezclar con tus bebidas favoritas."
  },
];

export const categories = ["Todas", "Cervezas", "Vinos", "Destilados", "Aperitivos"] as const;
export type CategoryFilter = (typeof categories)[number];

export const paymentMethods = ["Efectivo", "Transferencia", "Tarjeta", "Mercado Pago"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}
