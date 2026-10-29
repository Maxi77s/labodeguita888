"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Beer,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  MapPin,
  Martini,
  Minus,
  PartyPopper,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Wallet,
  Wine,
  X,
} from "lucide-react";
import {
  categories,
  products,
  formatMoney,
  paymentMethods,
  type CategoryFilter,
  type PaymentMethod,
  type Product,
} from "@/data/products";

type Cart = Record<number, number>;
type View = "product" | "cart" | "checkout" | null;
type Fulfillment = "delivery" | "retiro";
type SortBy = "featured" | "lower" | "higher" | "name";

type SuccessfulPurchase = {
  name: string;
  count: number;
  total: number;
  payment: PaymentMethod;
  fulfillment: Fulfillment;
};

type Customer = {
  name: string;
  phone: string;
  address: string;
  payment: PaymentMethod | "";
  notes: string;
};

const emptyCustomer: Customer = {
  name: "",
  phone: "",
  address: "",
  payment: "",
  notes: "",
};


function QuantityControl({
  value,
  onDecrease,
  onIncrease,
  label,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  label: string;
}) {
  return (
    <div className="quantity-control" aria-label={label}>
      <button
        type="button"
        aria-label={`Quitar una unidad de ${label}`}
        onClick={onDecrease}
      >
        <Minus size={15} strokeWidth={2.4} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label={`Agregar una unidad de ${label}`}
        onClick={onIncrease}
        disabled={value >= 99}
      >
        <Plus size={15} strokeWidth={2.4} />
      </button>
    </div>
  );
}

const store = {
  name: "La Bodeguita",
  titlePrefix: "LA",
  titleStrong: "BODEGUITA",
  subtitle: "Tu lugar para elegir las bebidas de cada encuentro.",
  heroLeft: "SABORES PARA COMPARTIR",
  heroRight: "BRINDÁ A TU MANERA",
  logo: "/images/la-bodeguita-logo.png",
  themeClass: "store-theme--bodeguita",
} as const;

export default function Storefront() {
  const storeProducts = products;
  const storageKey = "la-bodeguita-carrito-demo-v1";
  const [category, setCategory] = useState<CategoryFilter>("Todas");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortBy>("featured");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [toast, setToast] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState<SuccessfulPurchase | null>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  // Recuperar el carrito y normalizar las cantidades persistidas.
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(storageKey) || "{}",
      );
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const valid: Cart = {};
        for (const product of storeProducts) {
          const count = Number((saved as Record<string, unknown>)[product.id]);
          if (Number.isInteger(count) && count > 0)
            valid[product.id] = Math.min(99, count);
        }
        setCart(valid);
      }
    } catch {
      // El almacenamiento puede estar bloqueado; la tienda sigue funcionando.
    }
    setReady(true);
  }, [storageKey, storeProducts]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {}
  }, [cart, ready, storageKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2700);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!view && !purchaseSuccess) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setView(null);
        setPurchaseSuccess(null);
      }
    };
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeydown);
    };
  }, [view, purchaseSuccess]);

  useEffect(() => {
    if (purchaseSuccess) successButtonRef.current?.focus();
  }, [purchaseSuccess]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("es-AR");
    const list = storeProducts.filter(
      (p) =>
        (category === "Todas" || p.category === category) &&
        `${p.name} ${p.category} ${p.volume}`
          .toLocaleLowerCase("es-AR")
          .includes(q),
    );
    if (sort === "lower") list.sort((a, b) => a.price - b.price);
    if (sort === "higher") list.sort((a, b) => b.price - a.price);
    if (sort === "name")
      list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return list;
  }, [category, search, sort, storeProducts]);

  const cartItems = useMemo(
    () =>
      storeProducts
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((product) => ({ product, quantity: cart[product.id] })),
    [cart, storeProducts],
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  function addProduct(id: number, amount = 1) {
    setCart((current) => ({
      ...current,
      [id]: Math.min(99, (current[id] ?? 0) + amount),
    }));
    setToast("Agregado a tu carrito");
  }

  function changeQuantity(id: number, delta: number) {
    setCart((current) => {
      const updated = { ...current };
      const next = Math.min(99, (updated[id] ?? 0) + delta);
      if (next <= 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  }

  function removeProduct(id: number) {
    setCart((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
  }

  function openDetail(product: Product) {
    setSelected(product);
    setDetailQuantity(1);
    setView("product");
  }

  function finishPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cartItems.length) return;
    if (customer.name.trim().length < 2) {
      setToast("Ingresá un nombre válido.");
      return;
    }
    if (!customer.payment) {
      setToast("Elegí una forma de pago.");
      return;
    }
    if (fulfillment === "delivery" && !customer.address.trim()) {
      setToast("Ingresá tu dirección para el delivery.");
      return;
    }

    // Confirmación visual de demostración: no cobra ni envía el pedido.
    setPurchaseSuccess({
      name: customer.name.trim(),
      count: cartCount,
      total: cartTotal,
      payment: customer.payment,
      fulfillment,
    });
    setCart({});
    setCustomer({ ...emptyCustomer });
    setView(null);
    setToast("");
  }

  function goToSearch() {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchInput.current?.focus(), 250);
  }

  const deliveryToggle = (compact = false) => (
    <div
      className={`delivery-switch ${compact ? "delivery-switch--compact" : ""}`}
      role="group"
      aria-label="Modo de entrega"
    >
      <button
        type="button"
        className={fulfillment === "delivery" ? "is-active" : ""}
        aria-pressed={fulfillment === "delivery"}
        onClick={() => setFulfillment("delivery")}
      >
        <Truck size={18} strokeWidth={2.1} /> <span>Delivery</span>
      </button>
      <button
        type="button"
        className={fulfillment === "retiro" ? "is-active" : ""}
        aria-pressed={fulfillment === "retiro"}
        onClick={() => setFulfillment("retiro")}
      >
        <Store size={18} strokeWidth={2.1} /> <span>Retiro</span>
      </button>
    </div>
  );

  return (
    <div className={`store-theme ${store.themeClass}`}>
      <header className="header container">
        <a
          href="#inicio"
          className="header-brand"
          aria-label={`${store.name}, ir al inicio`}
        >
          {store.titlePrefix} <strong>{store.titleStrong}</strong>
        </a>
        <div className="header-actions">
          <button
            type="button"
            className="icon-button"
            title="Buscar bebidas"
            aria-label="Buscar bebidas"
            onClick={goToSearch}
          >
            <Search size={21} />
          </button>
          <button
            type="button"
            className="header-cart icon-button"
            title="Ver carrito"
            aria-label={`Ver carrito, ${cartCount} productos`}
            onClick={() => setView("cart")}
          >
            <ShoppingBag size={21} />{" "}
            <span className="header-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <main id="inicio">
        <div className="container hero-wrapper">
          <div className="hero" aria-label={`${store.name}, bebidas para compartir`}>
            <div className="hero-images" aria-hidden="true">
              <Image
                src="/images/fernet-branca.webp"
                alt=""
                width={245}
                height={245}
              />
              <Image
                src="/images/gin-bombay.webp"
                alt=""
                width={245}
                height={245}
              />
              <Image
                src="/images/corona-extra.webp"
                alt=""
                width={245}
                height={245}
              />
              <Image
                src="/images/malbec-trapiche.webp"
                alt=""
                width={245}
                height={245}
              />
            </div>
            <div className="hero-shade" />
            <div className="hero-logo">
              <Image
                src={store.logo}
                alt={store.name}
                width={180}
                height={148}
                priority
              />
            </div>
            <span className="hero-corner hero-corner--left">
              {store.heroLeft}
            </span>
            <span className="hero-corner hero-corner--right">
              {store.heroRight} <Sparkles size={13} />
            </span>
          </div>
        </div>

        <section
          className="container brand-section"
          aria-label="Información de la tienda"
        >
          <div className="brand-info">
            <div className="brand-avatar">
              <Image
                src={store.logo}
                alt={`Logo de ${store.name}`}
                width={75}
                height={62}
              />
            </div>
            <div>
              <p className="eyebrow">
                <span className="status-dot" /> TIENDA DE BEBIDAS
              </p>
              <h1>
                {store.name.toUpperCase()}<span className="brand-period">.</span>
              </h1>
              <p className="brand-subtitle">{store.subtitle}</p>
              <span className="brand-chip">
                <BadgeCheck size={13} /> Delivery & retiro
              </span>
            </div>
          </div>
          <div className="fulfillment-box">
            <div className="fulfillment-heading">
              <span>¿CÓMO LO QUERÉS RECIBIR?</span>
              <span className="mini-pill">
                <Check size={12} /> Elegí una opción
              </span>
            </div>
            {deliveryToggle()}
            <p>
              <MapPin size={13} />{" "}
              {fulfillment === "delivery"
                ? "Recibilo en tu domicilio"
                : "Retirá tu pedido por el local"}
            </p>
          </div>
        </section>

        <section className="toolbar" aria-label="Buscar y filtrar bebidas">
          <div className="container toolbar-inner">
            <label className="search-field">
              <Search size={18} />
              <input
                ref={searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscá tu bebida favorita..."
                aria-label="Buscar bebidas"
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <div
              className="category-track"
              role="group"
              aria-label="Categorías de bebidas"
            >
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`category-pill ${category === cat ? "selected" : ""}`}
                  aria-pressed={category === cat}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="catalogo" className="container catalog-section">
          <div className="catalog-heading">
            <div>
              <span className="section-overline">
                <Wine size={16} /> NUESTRO CATÁLOGO
              </span>
              <h2>
                ELEGÍ TUS BEBIDAS<span className="brand-period">.</span>
              </h2>
              <p>
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "bebida disponible"
                  : "bebidas disponibles"}{" "}
                para elegir
              </p>
            </div>
            <label className="sort-field">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Ordenar catálogo"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortBy)}
              >
                <option value="featured">Destacados</option>
                <option value="lower">Menor precio</option>
                <option value="higher">Mayor precio</option>
                <option value="name">Nombre A-Z</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>

          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <article className="product-card" key={product.id}>
                  <button
                    type="button"
                    className="product-image"
                    onClick={() => openDetail(product)}
                    aria-label={`Ver detalle de ${product.name}`}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 600px) 47vw, (max-width: 1024px) 31vw, 250px"
                    />
                    {product.badge && (
                      <span className="product-badge">
                        <Sparkles size={12} />
                        {product.badge}
                      </span>
                    )}
                    <span className="product-image-arrow">
                      <ArrowRight size={17} />
                    </span>
                  </button>
                  <div className="product-details">
                    <span className="product-category">{product.category}</span>
                    <button
                      className="product-name"
                      type="button"
                      onClick={() => openDetail(product)}
                    >
                      {product.name}
                    </button>
                    <p className="product-size">{product.volume}</p>
                    <div
                      className={`product-actions ${(cart[product.id] ?? 0) > 0 ? "product-actions--selected" : ""}`}
                    >
                      <strong>{formatMoney(product.price)}</strong>
                      {(cart[product.id] ?? 0) > 0 ? (
                        <div className="card-quantity-control">
                          <QuantityControl
                            label={product.name}
                            value={cart[product.id]}
                            onDecrease={() => changeQuantity(product.id, -1)}
                            onIncrease={() => changeQuantity(product.id, 1)}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="add-button"
                          onClick={() => addProduct(product.id)}
                          aria-label={`Agregar ${product.name} al carrito`}
                        >
                          <Plus size={21} strokeWidth={2.3} />
                        </button>
                      )}
                    </div>
                    {cart[product.id] ? (
                      <span className="added-indicator">
                        <Check size={13} /> En tu carrito
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <Search size={28} />
              <h3>No encontramos esa bebida</h3>
              <p>Probá con otra categoría o con otro nombre.</p>
              <button
                type="button"
                onClick={() => {
                  setCategory("Todas");
                  setSearch("");
                }}
                className="outline-button"
              >
                Ver todas las bebidas <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="catalog-footer">
            <span className="catalog-footer-line" />{" "}
            <span>
              <ShieldCheck size={16} /> Compra fácil, rápida y sin vueltas
            </span>
            <span className="catalog-footer-line" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <strong>
            {store.name.toUpperCase()}<span className="brand-period">.</span>
          </strong>
          <p>Solo mayores de 18 años. Beber con moderación.</p>
          <small>
            Maqueta de demostración · Productos y precios ilustrativos.
          </small>
        </div>
      </footer>

      {view === null && (
        <div className="floating-cart">
          <button
            type="button"
            onClick={() => setView("cart")}
            className="floating-cart-button"
            aria-label={`Ver mi pedido: ${cartCount} productos, ${formatMoney(cartTotal)}`}
          >
            <span className="floating-cart-left">
              <span className="floating-count">{cartCount}</span>
              <ShoppingBasket size={19} /> <span>VER MI PEDIDO</span>
            </span>
            <span className="floating-cart-total">
              {formatMoney(cartTotal)} <ArrowRight size={18} />
            </span>
          </button>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {view === "product" && selected && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setView(null);
          }}
        >
          <section
            className="product-modal modal-surface"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${selected.name}`}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setView(null)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
            <div className="modal-product-image">
              <Image
                src={selected.image}
                alt={selected.name}
                fill
                sizes="(max-width: 670px) 100vw, 340px"
              />
            </div>
            <div className="modal-product-info">
              <span className="section-overline">
                <Wine size={15} />
                {selected.category} · {selected.volume}
              </span>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
              <strong className="modal-product-price">
                {formatMoney(selected.price)}
              </strong>
              <div className="modal-divider" />
              <span className="field-label">CANTIDAD</span>
              <div className="detail-buy-row">
                <QuantityControl
                  label={selected.name}
                  value={detailQuantity}
                  onDecrease={() =>
                    setDetailQuantity((q) => Math.max(1, q - 1))
                  }
                  onIncrease={() =>
                    setDetailQuantity((q) => Math.min(99, q + 1))
                  }
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    addProduct(selected.id, detailQuantity);
                    setView(null);
                  }}
                >
                  <ShoppingBag size={18} /> AGREGAR <ArrowRight size={18} />
                </button>
              </div>
              <p className="detail-subtotal">
                Subtotal{" "}
                <strong>{formatMoney(selected.price * detailQuantity)}</strong>
              </p>
            </div>
          </section>
        </div>
      )}

      {view === "cart" && (
        <div
          className="modal-overlay drawer-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setView(null);
          }}
        >
          <aside
            className="side-drawer modal-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="drawer-header">
              <div>
                <span className="section-overline">
                  <ShoppingBag size={15} /> TU SELECCIÓN
                </span>
                <h2 id="cart-title">
                  MI PEDIDO<span className="brand-period">.</span>
                </h2>
              </div>
              <button
                type="button"
                className="modal-close modal-close-static"
                onClick={() => setView(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="drawer-content">
              {cartItems.length ? (
                cartItems.map(({ product, quantity }) => (
                  <div className="cart-item" key={product.id}>
                    <div className="cart-thumb">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="80px"
                      />
                    </div>
                    <div className="cart-item-center">
                      <h3>{product.name}</h3>
                      <span>{product.volume}</span>
                      <QuantityControl
                        label={product.name}
                        value={quantity}
                        onDecrease={() => changeQuantity(product.id, -1)}
                        onIncrease={() => changeQuantity(product.id, 1)}
                      />
                    </div>
                    <div className="cart-item-end">
                      <strong>{formatMoney(product.price * quantity)}</strong>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="remove-button"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <ShoppingBag size={35} />
                  </div>
                  <h3>TU CARRITO ESTÁ VACÍO</h3>
                  <p>Sumá tus bebidas favoritas y armá tu pedido.</p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setView(null)}
                  >
                    EXPLORAR BEBIDAS <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="drawer-bottom">
                <div className="summary-count">
                  <span>Productos ({cartCount})</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
                <div className="summary-total">
                  <span>TOTAL</span>
                  <strong>{formatMoney(cartTotal)}</strong>
                </div>
                <button
                  type="button"
                  className="btn-primary btn-large"
                  onClick={() => setView("checkout")}
                >
                  CONTINUAR PEDIDO <ArrowRight size={19} />
                </button>
                <p>
                  <ShieldCheck size={14} /> Compra de demostración, sin pagos
                  reales
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {view === "checkout" && (
        <div
          className="modal-overlay drawer-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setView(null);
          }}
        >
          <aside
            className="side-drawer checkout-drawer modal-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="drawer-header">
              <div>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setView("cart")}
                >
                  <ArrowLeft size={16} /> VOLVER AL CARRITO
                </button>
                <h2 id="checkout-title">
                  FINALIZAR PEDIDO<span className="brand-period">.</span>
                </h2>
              </div>
              <button
                type="button"
                className="modal-close modal-close-static"
                onClick={() => setView(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="checkout-form"
              id="checkout-form"
              onSubmit={finishPurchase}
            >
              <div className="checkout-fields">
                <p className="demo-note">
                  <CircleHelp size={17} /> Compra de prueba. Al finalizar se
                  muestra una alerta, sin realizar cobros.
                </p>
                <section className="form-section">
                  <h3>
                    <span className="step-number">01</span> TUS DATOS
                  </h3>
                  <label className="form-field">
                    Nombre y apellido <span>*</span>
                    <input
                      autoComplete="name"
                      type="text"
                      placeholder="Ingresá tu nombre"
                      required
                      minLength={2}
                      maxLength={100}
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer((c) => ({ ...c, name: e.target.value }))
                      }
                    />
                  </label>
                  <label className="form-field">
                    Teléfono <small>(opcional)</small>
                    <input
                      autoComplete="tel"
                      type="tel"
                      placeholder="Ej. 351 123 4567"
                      value={customer.phone}
                      maxLength={30}
                      onChange={(e) =>
                        setCustomer((c) => ({ ...c, phone: e.target.value }))
                      }
                    />
                  </label>
                </section>
                <section className="form-section">
                  <h3>
                    <span className="step-number">02</span> ENTREGA
                  </h3>
                  {deliveryToggle(true)}
                  {fulfillment === "delivery" && (
                    <label className="form-field address-field">
                      <MapPin size={15} /> Dirección de entrega <span>*</span>
                      <input
                        autoComplete="street-address"
                        type="text"
                        placeholder="Calle, número, barrio..."
                        required
                        maxLength={200}
                        value={customer.address}
                        onChange={(e) =>
                          setCustomer((c) => ({
                            ...c,
                            address: e.target.value,
                          }))
                        }
                      />
                    </label>
                  )}
                </section>
                <section className="form-section">
                  <h3>
                    <span className="step-number">03</span> FORMA DE PAGO
                  </h3>
                  <div
                    className="payment-grid"
                    role="group"
                    aria-label="Forma de pago"
                  >
                    {paymentMethods.map((method) => (
                      <button
                        type="button"
                        key={method}
                        className={`payment-option ${customer.payment === method ? "selected" : ""}`}
                        aria-pressed={customer.payment === method}
                        onClick={() =>
                          setCustomer((c) => ({ ...c, payment: method }))
                        }
                      >
                        {method === "Efectivo" ? (
                          <Wallet size={18} />
                        ) : method === "Tarjeta" ? (
                          <CreditCard size={18} />
                        ) : (
                          <BadgeCheck size={18} />
                        )}{" "}
                        <span>{method}</span>
                        {customer.payment === method && (
                          <Check size={16} className="payment-check" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="payment-hint">
                    Esta selección es informativa. No se realiza ningún pago.
                  </p>
                </section>
                <section className="form-section">
                  <label className="form-field">
                    Aclaraciones <small>(opcional)</small>
                    <textarea
                      placeholder="¿Algo que debamos saber?"
                      rows={3}
                      maxLength={500}
                      value={customer.notes}
                      onChange={(e) =>
                        setCustomer((c) => ({ ...c, notes: e.target.value }))
                      }
                    />
                  </label>
                </section>
                <section className="checkout-recap">
                  <h3>RESUMEN DEL PEDIDO</h3>
                  {cartItems.map(({ product, quantity }) => (
                    <div className="recap-item" key={product.id}>
                      <span>
                        {quantity} × {product.name}
                      </span>
                      <strong>{formatMoney(product.price * quantity)}</strong>
                    </div>
                  ))}
                  <div className="recap-total">
                    <span>TOTAL PRODUCTOS</span>
                    <strong>{formatMoney(cartTotal)}</strong>
                  </div>
                  {fulfillment === "delivery" && (
                    <small>
                      Envío no incluido. El costo se coordina por separado.
                    </small>
                  )}
                </section>
              </div>
              <div className="checkout-submit">
                <button
                  type="submit"
                  className="btn-primary btn-large"
                  disabled={cartItems.length === 0 || !customer.payment}
                >
                  <CheckCircle2 size={19} /> FINALIZAR COMPRA{" "}
                  <ArrowRight size={19} />
                </button>
                <p>
                  <ShieldCheck size={14} /> Simulación: no se cobra ni envía
                  ningún pedido.
                </p>
              </div>
            </form>
          </aside>
        </div>
      )}

      {purchaseSuccess && (
        <div
          className="purchase-success-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPurchaseSuccess(null);
            }
          }}
        >
          <section
            className="purchase-success-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-success-title"
            aria-describedby="purchase-success-description"
          >
            <div className="purchase-success-confetti" aria-hidden="true">
              {Array.from({ length: 14 }, (_, index) => (
                <i key={index} />
              ))}
            </div>

            <button
              type="button"
              className="purchase-success-close"
              aria-label="Cerrar confirmación"
              onClick={() => setPurchaseSuccess(null)}
            >
              <X size={19} />
            </button>

            <div className="purchase-success-decoration" aria-hidden="true">
              <Beer size={29} strokeWidth={1.8} />
              <span className="purchase-success-check">
                <Check size={38} strokeWidth={3.2} />
              </span>
              <Martini size={28} strokeWidth={1.8} />
            </div>

            <span className="purchase-success-kicker">
              <PartyPopper size={16} /> ¡SALUD Y GRACIAS!
            </span>
            <h2 id="purchase-success-title">
              ¡COMPRA REALIZADA<span>!</span>
            </h2>
            <p id="purchase-success-description" className="purchase-success-description">
              ¡Genial, <strong>{purchaseSuccess.name}</strong>! Tu compra se
              completó correctamente en esta demostración.
            </p>

            <div className="purchase-success-drinks" aria-hidden="true">
              <span>🍾</span><span>🥂</span><span>🍻</span>
            </div>

            <div className="purchase-success-summary">
              <div>
                <span>PRODUCTOS</span>
                <strong>
                  <ShoppingBasket size={16} /> {purchaseSuccess.count}
                </strong>
              </div>
              <div>
                <span>TOTAL</span>
                <strong>{formatMoney(purchaseSuccess.total)}</strong>
              </div>
            </div>

            <p className="purchase-success-meta">
              {purchaseSuccess.fulfillment === "delivery" ? "Delivery" : "Retiro"}
              <span aria-hidden="true"> · </span>
              {purchaseSuccess.payment}
            </p>

            <button
              ref={successButtonRef}
              type="button"
              className="purchase-success-button"
              onClick={() => setPurchaseSuccess(null)}
            >
              ¡GENIAL! SEGUIR EXPLORANDO <ArrowRight size={18} />
            </button>

            <small className="purchase-success-disclaimer">
              Pedido de prueba: no se realizó un cobro ni se envió una orden.
            </small>
          </section>
        </div>
      )}
    </div>
  );
}
