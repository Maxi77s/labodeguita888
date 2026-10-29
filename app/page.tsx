import type { Metadata } from "next";
import Storefront from "@/components/Storefront";

export const metadata: Metadata = {
  title: "La Bodeguita Drinks | Catálogo de bebidas",
  description: "Maqueta funcional del catálogo, carrito y compra de demostración de La Bodeguita Drinks.",
};

export default function Page() {
  return <Storefront />;
}
