# La Bodeguita Drinks — Maqueta funcional

Proyecto **independiente** de Next.js + TypeScript. No incluye otra tienda ni sistema multitienda.

## Iniciar en VS Code

1. Abrí esta carpeta en VS Code.
2. Ejecutá `npm install`.
3. Ejecutá `npm run dev`.
4. Entrá a http://localhost:3000.

## Funcionalidades de demostración

- Catálogo de bebidas, fotos y precios ilustrativos.
- Búsqueda, filtros de categoría y ordenamiento.
- Botones + y − en cada tarjeta, carrito persistido localmente.
- Modal de detalle, carrito, formulario de entrega/pago.
- Confirmación de compra animada. **No realiza pagos, envía pedidos ni controla stock real.**

## Personalizar

- `data/products.ts`: bebidas, fotos, precios y categorías.
- `public/images/la-bodeguita-logo.png`: logo de referencia recortado de la captura compartida; reemplazar por el archivo original cuando esté disponible.
- `app/globals.css`: paleta crema/marrón/dorado y diseño adaptable a celulares.
- `components/Storefront.tsx`: interacciones y formulario.

## Publicar

Subí esta carpeta a un repositorio y desplegala en Vercel con Root Directory `./` y Framework `Next.js`.
