import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  FileText,
  Filter,
  Heart,
  House,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  UserPlus,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const LOGO = "/manus-storage/grabzo-logo_c1b7cc5c.jpeg";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=85";
const money = (value = 0) => `₹${value.toLocaleString("en-IN")}`;
const rating = (value = 0) => (value / 10).toFixed(1);
const imageOf = (product: any, index = 0) => product?.images?.[index] ?? FALLBACK_IMAGE;

type GuestCartLine = { productId: number; quantity: number; product: any };

function useGuestCart() {
  const [lines, setLines] = useState<GuestCartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem("grabzo-guest-cart") ?? "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("grabzo-guest-cart", JSON.stringify(lines)); }, [lines]);
  const add = (product: any) => setLines(current => {
    const found = current.find(line => line.productId === product.id);
    return found ? current.map(line => line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { productId: product.id, quantity: 1, product }];
  });
  const update = (productId: number, quantity: number) => setLines(current => quantity <= 0 ? current.filter(line => line.productId !== productId) : current.map(line => line.productId === productId ? { ...line, quantity } : line));
  const clear = () => setLines([]);
  return { lines, add, update, clear, count: lines.reduce((sum, line) => sum + line.quantity, 0) };
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`} aria-label="Grabzo home"><img src={LOGO} alt="Grabzo — Shop More Live Better" /></Link>;
}

function BrandIntro() {
  const [visible, setVisible] = useState(() => {
    try { return sessionStorage.getItem("grabzo-brand-intro-seen") !== "1"; } catch { return true; }
  });
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("grabzo-brand-intro-seen", "1"); } catch {}
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [visible]);
  if (!visible) return null;
  return <div className="brand-intro" role="status" aria-label="Opening Grabzo"><div className="brand-intro-orbit brand-intro-orbit--one" /><div className="brand-intro-orbit brand-intro-orbit--two" /><div className="brand-intro-panel"><img src={LOGO} alt="Grabzo" /><span>Shop More <i>•</i> Live Better</span></div></div>;
}

function Header({ cartCount, onMenu, query, setQuery }: { cartCount: number; onMenu: () => void; query: string; setQuery: (value: string) => void }) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: unreadNotifications = 0 } = trpc.notifications.unreadCount.useQuery(undefined, { enabled: isAuthenticated });
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); navigate(`/products${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`); };
  return <>
    <header className="site-header">
      <div className="container header-inner">
        <button className="icon-button mobile-only" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button>
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/products" onClick={() => navigate("/products")}>Explore</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/products?deal=true">Deals</Link>
          <Link href="/products?sort=newest" onClick={() => navigate("/products?sort=newest")}>New arrivals</Link>
        </nav>
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={17} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, brands, sellers" aria-label="Search products" />
          {query && <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
        </form>
        <div className="header-actions">
          <Link href="/wishlist" className="header-action" aria-label="Wishlist"><Heart size={19} /><span className="desktop-only">Wishlist</span></Link>
          {isAuthenticated && <Link href="/notifications" className="header-action notification-action" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}><Bell size={19} /><span className="desktop-only">Updates</span>{unreadNotifications > 0 && <b>{unreadNotifications > 9 ? "9+" : unreadNotifications}</b>}</Link>}
          <Link href="/cart" className="header-action cart-action" aria-label="Cart"><ShoppingBag size={19} /><span className="desktop-only">Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</Link>
          <Link href="/account" className="header-action account-action" aria-label="Account"><CircleUserRound size={20} /><span className="desktop-only">{user?.name?.split(" ")[0] ?? "Account"}</span></Link>
        </div>
      </div>
    </header>
    <div className="shipping-strip"><div className="container shipping-strip-inner"><span><Sparkles size={13} /> Curated from 250+ independent sellers</span><span className="desktop-only">Free delivery on orders over ₹1,999</span><span className="desktop-only">Shop More <span className="dot">•</span> Live Better</span></div></div>
  </>;
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth();
  if (!open) return null;
  return <div className="mobile-menu-backdrop" onClick={onClose}><aside className="mobile-menu" onClick={event => event.stopPropagation()}><div className="mobile-menu-top"><Logo compact /><button className="icon-button" onClick={onClose} aria-label="Close menu"><X size={20} /></button></div><div className="mobile-menu-links"><Link href="/products" onClick={onClose}>Explore <ArrowUpRight size={16} /></Link><Link href="/vendors" onClick={onClose}>Vendors <ArrowUpRight size={16} /></Link><Link href="/products?deal=true" onClick={onClose}>Deals <ArrowUpRight size={16} /></Link><Link href="/orders" onClick={onClose}>My orders <ArrowUpRight size={16} /></Link><Link href="/wishlist" onClick={onClose}>Wishlist <ArrowUpRight size={16} /></Link>{isAuthenticated && <Link href="/notifications" onClick={onClose}>Updates <ArrowUpRight size={16} /></Link>}<Link href="/account" onClick={onClose}>Account <ArrowUpRight size={16} /></Link>{isAuthenticated && <button className="mobile-menu-logout" onClick={() => { void logout().then(() => { toast.success("You’ve been logged out."); onClose(); }); }}><LogOut size={16} /> Log out</button>}</div><div className="mobile-menu-note"><span className="eyebrow">The Grabzo edit</span><p>Products with a point of view, from sellers worth knowing.</p></div></aside></div>;
}

function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Logo /><p className="footer-tagline">Shop More <span>•</span> Live Better</p><p className="footer-copy">A better way to discover products, people, and places worth bringing home.</p></div><div className="footer-newsletter"><span className="eyebrow">Stay in the know</span><h3>Good things, in your inbox.</h3><form onSubmit={event => { event.preventDefault(); toast.success("You're on the list."); }}><input type="email" required placeholder="Your email address" aria-label="Your email address" /><button className="button button--dark" type="submit">Subscribe <ArrowRight size={16} /></button></form></div></div><div className="footer-links"><div><span className="eyebrow">Marketplace</span><Link href="/products">All products</Link><Link href="/vendors">Vendors</Link><Link href="/products?deal=true">Deals</Link><Link href="/products?sort=newest">New arrivals</Link></div><div><span className="eyebrow">For sellers</span><Link href="/seller">Seller dashboard</Link><Link href="/account">Become a seller</Link><a href="mailto:hello@grabzo.example">Seller guidelines</a></div><div><span className="eyebrow">Customer care</span><Link href="/orders">Track order</Link><a href="mailto:care@grabzo.example">Help center</a><a href="mailto:care@grabzo.example">Returns & shipping</a></div><div><span className="eyebrow">Grabzo</span><a href="mailto:hello@grabzo.example">About us</a><a href="mailto:hello@grabzo.example">Contact</a><a href="mailto:hello@grabzo.example">Privacy</a></div></div><div className="footer-bottom"><span>© 2026 Grabzo Marketplace</span><span>Made for the curious.</span><span className="footer-socials"><a href="#instagram">Instagram</a><a href="#linkedin">LinkedIn</a><a href="#x">X</a></span></div></div></footer>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="container page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div><div className="page-intro-right">{description && <p>{description}</p>}{action}</div></div>;
}

function ProductCard({ product, onAdd, onWishlist, wished = false }: { product: any; onAdd: (product: any) => void; onWishlist: (product: any) => void; wished?: boolean }) {
  return <article className="product-card">
    <div className="product-image-wrap"><Link href={`/product/${product.slug}`} className="product-image-link"><img src={imageOf(product)} alt={product.name} /><img className="product-image-secondary" src={imageOf(product, 1)} alt="" /></Link><button className={`wishlist-button ${wished ? "is-wished" : ""}`} onClick={() => onWishlist(product)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><Heart size={17} fill={wished ? "currentColor" : "none"} /></button><span className="product-quick-add" onClick={() => onAdd(product)}>Quick add <Plus size={14} /></span>{product.discount > 0 && <span className="product-discount">-{product.discount}%</span>}</div>
    <div className="product-meta"><div className="product-meta-top"><Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link><span className="product-rating"><Star size={12} fill="currentColor" /> {rating(product.rating)}</span></div><p className="product-vendor">{product.vendorName} <span>·</span> {product.category}</p><div className="product-price"><strong>{money(product.price)}</strong><s>{money(product.originalPrice)}</s></div><div className="product-stock"><span className={product.stock < 15 ? "stock-low" : "stock-good"}>{product.stock < 15 ? `Only ${product.stock} left` : "In stock"}</span><button onClick={() => onAdd(product)}>Add to bag</button></div></div>
  </article>;
}

function ProductGrid({ products, onAdd, onWishlist, wishedIds, empty = "Nothing here yet." }: { products: any[]; onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[]; empty?: string }) {
  if (!products.length) return <div className="empty-state"><Package size={28} /><h3>{empty}</h3><p>Try another search or explore a different edit.</p><Link className="button button--dark" href="/products">Browse products</Link></div>;
  return <div className="product-grid">{products.map((product, index) => <div className="reveal" style={{ "--delay": `${Math.min(index * 55, 360)}ms` } as React.CSSProperties} key={product.id}><ProductCard product={product} onAdd={onAdd} onWishlist={onWishlist} wished={wishedIds.includes(product.id)} /></div>)}</div>;
}

function Hero({ featured, onAdd }: { featured: any[]; onAdd: (product: any) => void }) {
  const heroProduct = featured[0];
  return <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><div className="hero-kicker"><span className="eyebrow">The marketplace edit · 01</span><span className="hero-rule" /></div><h1>Everything you want.<br /><em>One place.</em></h1><p>Discover products from trusted sellers, emerging brands, and independent stores — all in one considered marketplace.</p><div className="hero-actions"><Link className="button button--primary" href="/products">Explore products <ArrowRight size={17} /></Link><Link className="text-link" href="/account">Become a seller <ArrowUpRight size={16} /></Link></div><div className="hero-foot"><span>Scroll to explore</span><span className="scroll-line" /></div></div><div className="hero-art"><div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" /><div className="hero-art-main"><img src={imageOf(heroProduct)} alt={heroProduct?.name ?? "Curated product"} /></div><div className="hero-art-note"><span className="eyebrow">Now trending</span><strong>{heroProduct?.name ?? "Made for the curious"}</strong><span>{heroProduct?.vendorName ?? "Grabzo edit"}</span></div><div className="hero-floating hero-floating--top"><Zap size={15} fill="currentColor" /> 70% off</div><div className="hero-floating hero-floating--bottom">From sellers worth knowing <ArrowUpRight size={15} /></div><div className="hero-number">01 <span>/ 04</span></div></div></div></section>;
}

function CategoryRail({ categories }: { categories: any[] }) {
  return <section className="section category-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Browse by feeling</span><h2>Find your next <em>favourite.</em></h2></div><Link className="text-link" href="/products">View all categories <ArrowRight size={16} /></Link></div><div className="category-rail">{categories.map((category: any, index: number) => <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="category-card" key={category.id}><img src={category.image} alt="" /><div className="category-card-overlay" /><div className="category-card-content"><span className="category-index">0{index + 1}</span><div><span className="eyebrow">{category.eyebrow}</span><h3>{category.name}</h3></div><ArrowUpRight size={18} /></div></Link>)}</div></div></section>;
}

function VendorRail({ vendors }: { vendors: any[] }) {
  return <section className="section vendor-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Independent by design</span><h2>Meet the <em>makers.</em></h2></div><Link className="text-link" href="/vendors">Discover sellers <ArrowRight size={16} /></Link></div><div className="vendor-rail">{vendors.slice(0, 6).map((vendor: any) => <Link href={`/store/${vendor.slug}`} className="vendor-tile" key={vendor.id}><div className="vendor-avatar">{vendor.logo}</div><div><strong>{vendor.name}</strong><span>{vendor.location?.split(",")[0]} · {vendor.productCount} products</span></div><ArrowUpRight size={16} /></Link>)}</div></div></section>;
}

function PromoBand() {
  return <section className="promo-band"><div className="promo-shape promo-shape--one" /><div className="promo-shape promo-shape--two" /><div className="container promo-inner"><div><span className="eyebrow">The Grabzo edit · 02</span><h2>Good design.<br /><em>Better finds.</em></h2></div><div className="promo-copy"><p>A considered edit of things that make the everyday feel a little more yours.</p><Link className="button button--light" href="/products">Shop the edit <ArrowRight size={16} /></Link></div><div className="promo-stamp">GRABZO<br /><span>SHOP MORE<br />LIVE BETTER</span></div></div></section>;
}

function HomePage({ products, categories, vendors, deals, onAdd, onWishlist, wishedIds }: any) {
  return <><Hero featured={products} onAdd={onAdd} /><CategoryRail categories={categories} /><section className="section product-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">A little ahead of the curve</span><h2>Trending <em>now.</em></h2></div><Link className="text-link" href="/products?featured=true">See all products <ArrowRight size={16} /></Link></div><ProductGrid products={products.slice(0, 6)} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} /></div></section><PromoBand /><section className="section product-section product-section--deals"><div className="container"><div className="section-heading"><div><span className="eyebrow"><Zap size={13} /> Limited-time edit</span><h2>Today's <em>deals.</em></h2></div><Link className="text-link" href="/products?deal=true">Shop all deals <ArrowRight size={16} /></Link></div><ProductGrid products={deals.slice(0, 4)} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} /></div></section><VendorRail vendors={vendors} /><section className="trust-section"><div className="container trust-grid"><div><span className="eyebrow">Why Grabzo</span><h2>Shop with <em>confidence.</em></h2></div><div className="trust-items"><div><ShieldCheck size={20} /><strong>Verified sellers</strong><span>People worth buying from.</span></div><div><Truck size={20} /><strong>Easy delivery</strong><span>Simple, trackable, on time.</span></div><div><WalletCards size={20} /><strong>Secure checkout</strong><span>Your details stay yours.</span></div><div><Heart size={20} /><strong>Easy returns</strong><span>Because plans change.</span></div></div></div></section></>;
}

function ProductsPage({ onAdd, onWishlist, wishedIds }: { onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[] }) {
  const [location] = useLocation();
  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? ""), [location]);
  const isNewArrivals = params.get("sort") === "newest";
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState<any>(params.get("sort") ?? "relevance");
  useEffect(() => {
    setSearch(params.get("search") ?? "");
    setCategory(params.get("category") ?? "");
    setSort(params.get("sort") ?? "relevance");
  }, [params]);
  const { data: categories = [] } = trpc.catalog.categories.useQuery();
  const { data: vendors = [] } = trpc.catalog.vendors.useQuery();
  const { data: products = [], isLoading } = trpc.catalog.products.useQuery({ search: search || undefined, category: category || undefined, sort, deal: params.get("deal") === "true", featured: params.get("featured") === "true", limit: isNewArrivals ? 12 : 60 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  return <><PageIntro eyebrow={isNewArrivals ? "Freshly listed" : "The marketplace edit"} title={params.get("deal") === "true" ? "Deals worth grabbing." : isNewArrivals ? "New arrivals, just in." : "Products with a point of view."} description="Explore a more considered way to shop — across independent sellers, modern essentials, and the things you didn't know you needed." action={<span className="result-count">{products.length}{isNewArrivals ? " of 12" : ""} products</span>} /><div className="container products-layout"><aside className={`filter-sidebar ${filtersOpen ? "filter-sidebar--open" : ""}`}><div className="filter-top"><span className="eyebrow">Refine</span><button className="icon-button mobile-only" onClick={() => setFiltersOpen(false)}><X size={18} /></button></div><label className="filter-label">Search<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Try headphones" /></label><div className="filter-group"><span className="filter-label">Category</span><button className={!category ? "filter-option is-active" : "filter-option"} onClick={() => setCategory("")}>All products <span>({products.length})</span></button>{categories.map((item: any) => <button className={category === item.name ? "filter-option is-active" : "filter-option"} onClick={() => setCategory(item.name)} key={item.id}>{item.name}</button>)}</div><div className="filter-group"><span className="filter-label">Seller</span>{vendors.slice(0, 5).map((vendor: any) => <button className="filter-option" onClick={() => setSearch(vendor.name)} key={vendor.id}>{vendor.name}</button>)}</div><button className="text-link filter-reset" onClick={() => { setSearch(""); setCategory(""); setSort(isNewArrivals ? "newest" : "relevance"); }}>Reset filters <X size={14} /></button></aside><main className="products-main"><div className="products-toolbar"><button className="filter-trigger mobile-only" onClick={() => setFiltersOpen(true)}><Filter size={16} /> Filters</button><span className="desktop-only">Showing {products.length} results</span><label className="sort-select">Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="relevance">Relevance</option><option value="newest">Newest</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option><option value="rating">Top rated</option></select><ChevronDown size={14} /></label></div>{isLoading ? <LoadingGrid /> : <ProductGrid products={products} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} empty="No products matched that edit." />}</main></div></>;
}

function LoadingGrid() { return <div className="product-grid">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton-card" key={index}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line skeleton-line--short" /></div>)}</div>; }

function ProductPage({ onAdd, onWishlist, wishedIds }: { onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[] }) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const slug = location.split("/product/")[1]?.split("?")[0] ?? "";
  const { data: product, isLoading } = trpc.catalog.bySlug.useQuery({ slug });
  const { data: reviews = [] } = trpc.reviews.list.useQuery({ productId: product?.id ?? 0 }, { enabled: Boolean(product?.id) });
  const { data: reviewStatus } = trpc.reviews.status.useQuery({ productId: product?.id ?? 0 }, { enabled: isAuthenticated && Boolean(product?.id) });
  const utils = trpc.useUtils();
  const [activeImage, setActiveImage] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  if (isLoading) return <div className="container loading-page"><LoadingGrid /></div>;
  if (!product) return <div className="container empty-state page-empty"><Package size={28} /><h3>That product has moved on.</h3><Link className="button button--dark" href="/products">Back to products</Link></div>;
  return <><div className="container breadcrumb"><Link href="/products">Products</Link><ChevronRight size={14} /><span>{product.category}</span><ChevronRight size={14} /><span>{product.name}</span></div><section className="container product-detail"><div className="gallery"><div className="gallery-main"><img src={imageOf(product, activeImage)} alt={product.name} /><span className="gallery-count">0{activeImage + 1} / 0{product.images.length}</span></div><div className="gallery-thumbs">{product.images.map((image: string, index: number) => <button className={activeImage === index ? "gallery-thumb is-active" : "gallery-thumb"} onClick={() => setActiveImage(index)} key={image}><img src={image} alt="" /></button>)}</div></div><div className="product-detail-copy"><span className="eyebrow">{product.category} · {product.brand}</span><h1>{product.name}</h1><div className="detail-rating"><span><Star size={14} fill="currentColor" /> {rating(product.rating)}</span><span>{product.reviewCount} reviews</span><span className="verified-dot"><Check size={12} /> Verified</span></div><div className="detail-price"><strong>{money(product.price)}</strong><s>{money(product.originalPrice)}</s><span>{product.discount}% off</span></div><p className="detail-description">{product.description}</p><div className="detail-stock"><span className="stock-good">● In stock</span><span>Ships from {product.vendorName}</span></div><div className="detail-actions"><button className="button button--primary button--large" onClick={() => onAdd(product)}>Add to bag <ShoppingBag size={17} /></button><button className={`wishlist-detail ${wishedIds.includes(product.id) ? "is-wished" : ""}`} onClick={() => onWishlist(product)}><Heart size={18} fill={wishedIds.includes(product.id) ? "currentColor" : "none"} /> {wishedIds.includes(product.id) ? "Saved" : "Save"}</button></div><div className="detail-service"><div><Truck size={18} /><span><strong>Free delivery</strong> on orders over ₹1,999</span></div><div><ShieldCheck size={18} /><span><strong>Easy returns</strong> within 7 days</span></div><div><Store size={18} /><span>Sold by <Link href={`/store/${product.vendorName.toLowerCase().replace(/\s+/g, "")}`}>{product.vendorName}</Link></span></div></div><div className="detail-specs"><span className="eyebrow">Details</span>{Object.entries(product.specifications ?? {}).map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}</div><div className="detail-reviews"><div className="reviews-heading"><div><span className="eyebrow">What people say</span><strong><Star size={14} fill="currentColor" /> {rating(product.rating)}</strong></div>{reviewStatus?.eligible && !reviewStatus.reviewed && <button className="text-link" onClick={() => setReviewOpen(true)}><Star size={14} /> Rate this product</button>}</div>{reviewOpen && <ReviewForm product={product} onDone={() => { setReviewOpen(false); void utils.reviews.list.invalidate({ productId: product.id }); void utils.reviews.status.invalidate({ productId: product.id }); void utils.catalog.bySlug.invalidate({ slug: product.slug }); }} />}{reviews.length ? reviews.slice(0, 3).map((review: any) => <div className="review-row" key={review.id}><div className="review-stars">{"★".repeat(review.rating)}<span>{"★".repeat(5 - review.rating)}</span></div><strong>{review.title}</strong><p>{review.body}</p><span>{review.userName} · Verified purchase</span></div>) : <p className="muted-copy">First to leave a review for this product.</p>}</div></div></section></>;
}

function VendorsPage() {
  const { data: vendors = [], isLoading } = trpc.catalog.vendors.useQuery();
  return <><PageIntro eyebrow="Independent by design" title="Sellers worth knowing." description="Every store on Grabzo is a point of view — with products, people, and stories that make the marketplace feel human." action={<Link href="/account" className="button button--dark">Become a seller <ArrowUpRight size={16} /></Link>} /><div className="container vendor-directory">{isLoading ? <LoadingGrid /> : vendors.map((vendor: any, index: number) => <Link href={`/store/${vendor.slug}`} className="vendor-directory-card reveal" style={{ "--delay": `${index * 45}ms` } as React.CSSProperties} key={vendor.id}><div className="vendor-cover"><img src={vendor.coverImage} alt="" /><div className="vendor-cover-wash" /></div><div className="vendor-directory-content"><div className="vendor-avatar vendor-avatar--large">{vendor.logo}</div><div className="vendor-directory-name"><div><h3>{vendor.name}</h3>{vendor.verified && <span className="verified-badge"><Check size={11} /> Verified</span>}</div><p>{vendor.description}</p></div><ArrowUpRight className="vendor-arrow" size={20} /><div className="vendor-directory-stats"><span><Star size={13} fill="currentColor" /> {rating(vendor.rating)}</span><span>{vendor.productCount} products</span><span>{vendor.location}</span></div></div></Link>)}</div></>;
}

function VendorPage({ onAdd, onWishlist, wishedIds }: { onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[] }) {
  const [location] = useLocation();
  const slug = location.split("/store/")[1]?.split("?")[0] ?? "";
  const { isAuthenticated } = useAuth();
  const { data: vendor, isLoading } = trpc.catalog.vendorBySlug.useQuery({ slug });
  const { data: following = false } = trpc.catalog.vendorFollowing.useQuery({ slug }, { enabled: isAuthenticated });
  const toggleFollowing = trpc.catalog.toggleVendorFollowing.useMutation({ onSuccess: value => toast.success(value ? `You're now following ${vendor?.name}.` : `You're no longer following ${vendor?.name}.`) });
  if (isLoading) return <div className="container loading-page"><LoadingGrid /></div>;
  if (!vendor) return <div className="container empty-state page-empty"><Store size={28} /><h3>That store is taking a break.</h3><Link className="button button--dark" href="/vendors">Discover other sellers</Link></div>;
  return <><section className="vendor-hero"><img src={vendor.coverImage ?? FALLBACK_IMAGE} alt="" /><div className="vendor-hero-wash" /><div className="container vendor-hero-copy"><span className="eyebrow">Independent seller · {vendor.location}</span><h1>{vendor.name}</h1><p>{vendor.description}</p><div className="vendor-hero-meta"><span><Star size={14} fill="currentColor" /> {rating(vendor.rating)} · {vendor.reviewCount} reviews</span><span>{vendor.followers.toLocaleString("en-IN")} followers</span><button className="button button--light" onClick={() => isAuthenticated ? toggleFollowing.mutate({ slug }) : startLogin()}>{following ? "Following" : "Follow store"} {following ? <Check size={16} /> : <Plus size={16} />}</button></div></div></section><div className="container store-layout"><aside className="store-sidebar"><span className="eyebrow">About the store</span><p>{vendor.description} Every order supports an independent seller on Grabzo.</p><div className="store-sidebar-stat"><strong>{vendor.products.length}</strong><span>products in the edit</span></div><div className="store-sidebar-stat"><strong>{vendor.categories.length}</strong><span>categories</span></div><div className="store-sidebar-links"><span className="eyebrow">Shop by</span>{vendor.categories.map((category: string) => <Link href={`/products?category=${encodeURIComponent(category)}`} key={category}>{category} <ArrowUpRight size={14} /></Link>)}</div></aside><main><div className="store-products-heading"><div><span className="eyebrow">Featured collection</span><h2>From {vendor.name}</h2></div><span>{vendor.products.length} products</span></div><ProductGrid products={vendor.products} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} /></main></div></>;
}

function AuthGate({ children, title = "Sign in to keep going." }: { children?: React.ReactNode; title?: string }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="container loading-page"><div className="spinner" /></div>;
  if (!isAuthenticated) return <div className="auth-gate"><div className="auth-gate-icon"><CircleUserRound size={26} /></div><span className="eyebrow">Your Grabzo account</span><h1>{title}</h1><p>Save your finds, sync your bag, and keep every order in one place.</p><button className="button button--primary" onClick={() => startLogin()}>Sign in to Grabzo <ArrowRight size={16} /></button></div>;
  return <>{children}</>;
}

function LoginLanding() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const pending = login.isPending || register.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (mode === "register" && password !== confirmPassword) {
      setFormError("Your passwords do not match.");
      return;
    }
    const options = {
      onSuccess: async () => {
        await utils.auth.me.invalidate();
        toast.success(mode === "login" ? "Welcome back to Grabzo." : "Your Grabzo account is ready.");
        navigate("/products");
      },
      onError: (error: { message: string }) => setFormError(error.message),
    };
    if (mode === "login") login.mutate({ email, password }, options);
    else register.mutate({ name, email, password }, options);
  };

  return <div className="login-landing"><div className="login-landing-orbit login-landing-orbit--one" /><div className="login-landing-orbit login-landing-orbit--two" /><div className="login-card login-card--native"><Logo compact /><span className="eyebrow">Your Grabzo account</span><h1>{mode === "login" ? <>Shop more.<br /><em>Live better.</em></> : <>Make room for<br /><em>good finds.</em></>}</h1><p>{mode === "login" ? "Sign in to keep your finds, bag, wishlist, and orders together." : "Create a Grabzo account and keep your favourite discoveries close."}</p><div className="auth-mode-toggle" role="tablist" aria-label="Account access"><button className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setFormError(""); }} role="tab" aria-selected={mode === "login"}>Sign in</button><button className={mode === "register" ? "is-active" : ""} onClick={() => { setMode("register"); setFormError(""); }} role="tab" aria-selected={mode === "register"}>Create account</button></div><form className="grabzo-auth-form" onSubmit={submit}>{mode === "register" && <label>Full name<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required minLength={2} placeholder="Your name" /></label>}<label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} /></label>{mode === "register" && <label>Confirm password<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} placeholder="Repeat your password" /></label>}{formError && <p className="grabzo-auth-error" role="alert">{formError}</p>}<button className="button button--primary button--full grabzo-auth-submit" disabled={pending} type="submit">{pending ? "Please wait…" : mode === "login" ? "Sign in to Grabzo" : "Create my account"}<ArrowRight size={16} /></button></form><span className="login-note"><ShieldCheck size={14} /> Secure account access, made for Grabzo.</span><Link className="login-browse" href="/products">Browse the marketplace first <ArrowUpRight size={14} /></Link></div></div>;
}

function CartPage({ guest, onUpdateGuest, onClearGuest, onAdd, onLogin }: { guest: GuestCartLine[]; onUpdateGuest: (id: number, quantity: number) => void; onClearGuest: () => void; onAdd: (product: any) => void; onLogin: () => void }) {
  const { isAuthenticated } = useAuth();
  const { data: serverCart, isLoading } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const update = trpc.cart.update.useMutation({ onSuccess: () => toast.success("Bag updated") });
  const remove = trpc.cart.remove.useMutation({ onSuccess: () => toast.success("Removed from bag") });
  const clear = trpc.cart.clear.useMutation({ onSuccess: () => toast.success("Bag cleared") });
  const cart = isAuthenticated ? serverCart : { items: guest.map(line => ({ ...line.product, productId: line.productId, quantity: line.quantity, image: imageOf(line.product), vendorName: line.product.vendorName })), subtotal: guest.reduce((sum, line) => sum + line.product.price * line.quantity, 0), discount: guest.reduce((sum, line) => sum + (line.product.originalPrice - line.product.price) * line.quantity, 0), delivery: guest.reduce((sum, line) => sum + line.product.price * line.quantity, 0) >= 1999 ? 0 : 99, tax: Math.round(guest.reduce((sum, line) => sum + line.product.price * line.quantity, 0) * 0.05), total: guest.reduce((sum, line) => sum + line.product.price * line.quantity, 0) + (guest.length ? 99 : 0) };
  if (isAuthenticated && isLoading) return <div className="container loading-page"><div className="spinner" /></div>;
  const items = cart?.items ?? [];
  return <><PageIntro eyebrow="Your edit" title="Your bag." description={items.length ? `${items.length} item${items.length > 1 ? "s" : ""} from independent sellers.` : "The things you save for later, all in one place."} /><div className="container cart-layout">{items.length ? <><div className="cart-items"><div className="cart-vendor-label"><span className="eyebrow">Ready to ship</span><span>Free delivery over ₹1,999</span></div>{items.map((item: any) => <div className="cart-line" key={item.productId}><Link href={`/product/${item.slug}`} className="cart-line-image"><img src={item.image ?? imageOf(item)} alt="" /></Link><div className="cart-line-copy"><Link href={`/product/${item.slug}`}><strong>{item.name}</strong></Link><span>{item.vendorName}</span><span className="cart-line-price">{money(item.price)}</span></div><div className="quantity-control"><button onClick={() => isAuthenticated ? update.mutate({ productId: item.productId, quantity: item.quantity - 1 }) : onUpdateGuest(item.productId, item.quantity - 1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => isAuthenticated ? update.mutate({ productId: item.productId, quantity: item.quantity + 1 }) : onUpdateGuest(item.productId, item.quantity + 1)} aria-label="Increase quantity">+</button></div><button className="remove-line" onClick={() => isAuthenticated ? remove.mutate({ productId: item.productId }) : onUpdateGuest(item.productId, 0)}>Remove</button></div>)}<button className="text-link clear-bag" onClick={() => isAuthenticated ? clear.mutate() : onClearGuest()}>Clear bag <X size={14} /></button></div><aside className="cart-summary"><span className="eyebrow">Order summary</span><div><span>Subtotal</span><strong>{money(cart?.subtotal)}</strong></div><div><span>Discount</span><strong className="summary-discount">− {money(cart?.discount)}</strong></div><div><span>Delivery</span><strong>{cart?.delivery ? money(cart.delivery) : "Free"}</strong></div><div><span>Estimated tax</span><strong>{money(cart?.tax)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(cart?.total)}</strong></div>{isAuthenticated ? <Link href="/checkout" className="button button--primary button--full">Proceed to checkout <ArrowRight size={17} /></Link> : <button className="button button--primary button--full" onClick={onLogin}>Sign in to checkout <ArrowRight size={17} /></button>}<p className="summary-note"><ShieldCheck size={14} /> Secure, mock payment flow for this demo.</p></aside></> : <div className="empty-state cart-empty"><ShoppingBag size={30} /><h3>Your bag is taking a breather.</h3><p>Find something good and it will show up here.</p><Link className="button button--dark" href="/products">Explore products</Link></div>}</div></>;
}

function CheckoutPage({ guest, clearGuest }: { guest: GuestCartLine[]; clearGuest: () => void }) {
  const { isAuthenticated, user } = useAuth();
  const { data: serverCart } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const createOrder = trpc.orders.create.useMutation();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState<any>("upi");
  const [address, setAddress] = useState({ name: user?.name ?? "", phone: "", house: "", street: "", city: "", state: "", pincode: "" });
  const items = serverCart?.items ?? guest.map(line => ({ productId: line.productId, quantity: line.quantity, price: line.product.price, name: line.product.name, vendorName: line.product.vendorName, image: imageOf(line.product) }));
  const subtotal = serverCart?.subtotal ?? guest.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  if (!isAuthenticated) return <AuthGate title="Sign in before checkout." />;
  const placeOrder = () => createOrder.mutate({ items: items.map((item: any) => ({ productId: item.productId, quantity: item.quantity })), address, paymentMethod: payment }, { onSuccess: result => { clearGuest(); navigate(`/orders?success=${result.orderNumber}`); toast.success("Order placed — thank you for shopping with Grabzo."); }, onError: error => toast.error(error.message) });
  return <><PageIntro eyebrow="Almost yours" title="Checkout." description="A calm, simple checkout. No real payment is processed in this prototype." /><div className="container checkout-layout"><div className="checkout-main"><div className="checkout-steps"><span className={step >= 1 ? "is-active" : ""}>01 <b>Delivery</b></span><span className={step >= 2 ? "is-active" : ""}>02 <b>Review</b></span><span className={step >= 3 ? "is-active" : ""}>03 <b>Payment</b></span></div>{step === 1 && <div className="checkout-panel"><div className="checkout-panel-heading"><div><span className="eyebrow">Step 01</span><h2>Where should we send it?</h2></div><House size={20} /></div><div className="form-grid">{Object.entries(address).map(([key, value]) => <label key={key}>{key === "house" ? "House / building" : key.charAt(0).toUpperCase() + key.slice(1)}<input value={value} required onChange={event => setAddress(current => ({ ...current, [key]: event.target.value }))} /></label>)}</div><button className="button button--primary" onClick={() => setStep(2)}>Review order <ArrowRight size={16} /></button></div>}{step === 2 && <div className="checkout-panel"><div className="checkout-panel-heading"><div><span className="eyebrow">Step 02</span><h2>Everything look right?</h2></div><Package size={20} /></div><div className="checkout-review-list">{items.map((item: any) => <div key={item.productId}><img src={item.image ?? imageOf(item)} alt="" /><span><strong>{item.name}</strong><small>{item.vendorName} · Qty {item.quantity}</small></span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="checkout-panel-actions"><button className="text-link" onClick={() => setStep(1)}><ChevronLeft size={15} /> Back</button><button className="button button--primary" onClick={() => setStep(3)}>Continue to payment <ArrowRight size={16} /></button></div></div>}{step === 3 && <div className="checkout-panel"><div className="checkout-panel-heading"><div><span className="eyebrow">Step 03</span><h2>Choose how to pay.</h2></div><CreditCard size={20} /></div><div className="payment-options">{[["upi", "UPI", "Fast and familiar"], ["credit_card", "Credit card", "Visa, Mastercard, Amex"], ["debit_card", "Debit card", "Your bank card"], ["cod", "Cash on delivery", "Pay when it arrives"]].map(([value, name, note]) => <button className={payment === value ? "payment-option is-selected" : "payment-option"} onClick={() => setPayment(value)} key={value}><span className="payment-radio" /> <span><strong>{name}</strong><small>{note}</small></span><ChevronRight size={16} /></button>)}</div><div className="checkout-panel-actions"><button className="text-link" onClick={() => setStep(2)}><ChevronLeft size={15} /> Back</button><button className="button button--primary" disabled={createOrder.isPending} onClick={placeOrder}>{createOrder.isPending ? "Placing order…" : "Place order"} <ArrowRight size={16} /></button></div></div>}</div><aside className="checkout-summary cart-summary"><span className="eyebrow">Summary</span><div><span>Subtotal</span><strong>{money(serverCart?.subtotal ?? subtotal)}</strong></div><div><span>Delivery</span><strong>{serverCart?.delivery ? money(serverCart.delivery) : "Free"}</strong></div><div><span>Tax</span><strong>{money(serverCart?.tax ?? Math.round(subtotal * 0.05))}</strong></div><div className="summary-total"><span>Total</span><strong>{money(serverCart?.total ?? subtotal)}</strong></div><span className="summary-note"><ShieldCheck size={14} /> Mock payment — no charge will be made.</span></aside></div></>;
}

function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  if (loading) return <div className="container loading-page"><div className="spinner" /></div>;
  if (!isAuthenticated) return <><PageIntro eyebrow="Your Grabzo account" title="Make room for good finds." description="Save your edit, sync your bag, and keep every order in one calm place." /><div className="container account-choice-grid"><button className="account-choice" onClick={() => startLogin()}><span className="account-choice-icon"><CircleUserRound size={24} /></span><span className="eyebrow">Already have an account?</span><h2>Sign in</h2><p>Pick up where you left off and see your saved products, bag, and orders.</p><span className="button button--primary">Existing user <ArrowRight size={16} /></span></button><button className="account-choice account-choice--accent" onClick={() => startLogin()}><span className="account-choice-icon"><UserPlus size={24} /></span><span className="eyebrow">New to Grabzo?</span><h2>Create your account</h2><p>Join the marketplace edit and keep your favourite discoveries close.</p><span className="button button--dark">New user <ArrowRight size={16} /></span></button></div><div className="container account-note"><ShieldCheck size={17} /><span>Secure, native Grabzo account access.</span></div></>;
  return <><PageIntro eyebrow="Your Grabzo account" title={`Good to see you, ${user?.name?.split(" ")[0] ?? "there"}.`} description="Manage your profile, saved products, and every order from one place." action={<button className="button button--dark" onClick={() => logout().then(() => toast.success("You’ve been logged out."))}><LogOut size={16} /> Log out</button>} /><div className="container account-dashboard"><div className="account-profile-card"><span className="account-avatar">{(user?.name ?? "G").slice(0, 1).toUpperCase()}</span><div><span className="eyebrow">Signed in as</span><h2>{user?.name ?? "Grabzo shopper"}</h2><p>{user?.email ?? "Your secure Grabzo account"}</p></div><span className="verified-badge"><Check size={12} /> Secure account</span></div><div className="account-link-grid"><button onClick={() => navigate("/orders")}><ReceiptText size={20} /><strong>Your orders</strong><span>Track deliveries and payment status.</span><ArrowUpRight size={15} /></button><button onClick={() => navigate("/wishlist")}><Heart size={20} /><strong>Wishlist</strong><span>Return to the things you saved.</span><ArrowUpRight size={15} /></button><button onClick={() => navigate("/cart")}><ShoppingBag size={20} /><strong>Your bag</strong><span>Review your current edit.</span><ArrowUpRight size={15} /></button><button onClick={() => navigate("/seller")}><Store size={20} /><strong>Sell on Grabzo</strong><span>Explore the seller studio.</span><ArrowUpRight size={15} /></button></div></div></>;
}

function ReviewForm({ product, onDone }: { product: any; onDone: () => void }) {
  const [ratingValue, setRatingValue] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const create = trpc.reviews.create.useMutation({
    onSuccess: () => { toast.success("Thanks — your verified review is live."); onDone(); },
    onError: error => toast.error(error.message),
  });
  return <form className="review-form" onSubmit={event => { event.preventDefault(); create.mutate({ productId: product.id, rating: ratingValue, title, body }); }}>
    <div className="review-form-heading"><div><span className="eyebrow">Verified purchase</span><h3>How was {product.name}?</h3></div><button type="button" className="icon-button" onClick={onDone} aria-label="Close review form"><X size={17} /></button></div>
    <div className="rating-picker" role="radiogroup" aria-label="Product rating">{[1, 2, 3, 4, 5].map(value => <button type="button" role="radio" aria-checked={ratingValue === value} aria-label={`${value} out of 5 stars`} className={value <= ratingValue ? "is-selected" : ""} onClick={() => setRatingValue(value)} key={value}><Star size={20} fill="currentColor" /></button>)}</div>
    <label>Review title<input value={title} onChange={event => setTitle(event.target.value)} minLength={2} maxLength={180} required placeholder="What stood out?" /></label>
    <label>Your review<textarea value={body} onChange={event => setBody(event.target.value)} minLength={10} maxLength={2000} required placeholder="Share a useful detail for the next shopper." rows={4} /></label>
    <div className="review-form-actions"><span>{body.length}/2000</span><button className="button button--primary" type="submit" disabled={create.isPending}>{create.isPending ? "Publishing…" : "Publish review"} <ArrowRight size={15} /></button></div>
  </form>;
}

const orderStatusSteps = [
  { key: "placed", label: "Order placed", note: "We received your order." },
  { key: "confirmed", label: "Confirmed", note: "The seller confirmed it." },
  { key: "packed", label: "Packed", note: "Your parcel is being prepared." },
  { key: "shipped", label: "Shipped", note: "It is on the way." },
  { key: "out_for_delivery", label: "Out for delivery", note: "Arriving today." },
  { key: "delivered", label: "Delivered", note: "Enjoy your new find." },
];

const trackingStages = [
  { key: "processing", label: "Processing", note: "Order received and being prepared." },
  { key: "shipped", label: "Shipped", note: "Your order is on the way." },
  { key: "delivered", label: "Delivered", note: "Enjoy your new find." },
];

function ReturnRequestPanel({ order }: { order: any }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Not as expected");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(order.total);
  const utils = trpc.useUtils();
  const { data: requests = [], isLoading } = trpc.orders.returns.useQuery({ orderNumber: order.orderNumber });
  const request = trpc.orders.requestReturn.useMutation({ onSuccess: () => { toast.success("Return request submitted."); setOpen(false); void utils.orders.returns.invalidate({ orderNumber: order.orderNumber }); void utils.orders.get.invalidate({ orderNumber: order.orderNumber }); }, onError: error => toast.error(error.message) });
  const eligible = order.status === "delivered";
  const active = requests.find((item: any) => ["requested", "approved", "received"].includes(item.status));
  return <div className="container return-panel-wrap"><div className="order-detail-panel return-panel"><div className="order-panel-heading"><div><span className="eyebrow">Returns & refunds</span><h2>{active ? "Your return is in progress." : "Need to return something?"}</h2></div><RefreshCw size={19} /></div>{isLoading ? <div className="spinner" /> : requests.length ? <div className="return-history">{requests.map((item: any) => <div className="return-history-row" key={item.id}><div><strong>{item.reason}</strong><span>{item.items?.map((entry: any) => `${entry.productName} × ${entry.quantity}`).join(" · ")}</span></div><div><span className={`return-status return-status--${item.status}`}>{item.status}</span><small>{item.status === "refunded" && item.refundReference ? `Refund ${item.refundReference}` : `Requested ${new Date(item.requestedAt).toLocaleDateString("en-IN")}`}</small></div></div>)}</div> : <p className="muted-copy">Returns are available for delivered orders. Refunds are reviewed by the seller and issued to the original payment method.</p>}{eligible && !active && <button className="button button--dark" onClick={() => setOpen(value => !value)}>{open ? "Close return form" : "Request a return"} <ArrowRight size={15} /></button>}{open && <form className="return-form" onSubmit={event => { event.preventDefault(); request.mutate({ orderNumber: order.orderNumber, reason, customerNote: note, refundAmount: Math.min(order.total, Math.max(1, Number(amount))), items: order.items.map((item: any) => ({ productId: item.productId, quantity: item.quantity })) }); }}><label>Reason<select value={reason} onChange={event => setReason(event.target.value)}><option>Not as expected</option><option>Damaged or defective</option><option>Wrong item received</option><option>Changed my mind</option><option>Missing parts or accessories</option></select></label><label>Refund amount<input type="number" min="1" max={order.total} value={amount} onChange={event => setAmount(Number(event.target.value))} /></label><label>Customer note<textarea value={note} onChange={event => setNote(event.target.value)} maxLength={1000} rows={3} placeholder="Tell the seller what happened." /></label><button className="button button--primary" disabled={request.isPending}>{request.isPending ? "Submitting…" : "Submit return request"}</button></form>}</div></div>;
}

function OrderDetailPage() {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const orderNumber = decodeURIComponent(location.split("/order/")[1]?.split("?")[0] ?? "");
  const utils = trpc.useUtils();
  const { data: order, isLoading, isError } = trpc.orders.get.useQuery({ orderNumber }, { enabled: isAuthenticated && Boolean(orderNumber) });
  const { data: trackingEvents = [] } = trpc.orders.events.useQuery({ orderNumber }, { enabled: isAuthenticated && Boolean(orderNumber) });
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewingProductId, setReviewingProductId] = useState<number | null>(null);
  const cancel = trpc.orders.cancel.useMutation({ onSuccess: () => { toast.success("Order cancelled successfully."); setCancelOpen(false); void utils.orders.get.invalidate({ orderNumber }); void utils.orders.list.invalidate(); }, onError: error => toast.error(error.message) });
  const reorder = trpc.orders.reorder.useMutation({ onSuccess: result => { if (result.addedItems.length) { toast.success(`${result.addedItems.length} item${result.addedItems.length > 1 ? "s" : ""} added back to your bag.`); navigate("/cart"); } else toast.error("None of the items are currently available."); if (result.unavailableItems.length) toast.message(`${result.unavailableItems.length} item${result.unavailableItems.length > 1 ? "s" : ""} could not be added.`); }, onError: error => toast.error(error.message) });
  if (!isAuthenticated) return <AuthGate title="Sign in to view this order." />;
  if (isLoading) return <div className="container loading-page"><div className="spinner" /></div>;
  if (isError || !order) return <div className="container empty-state page-empty"><Package size={30} /><h3>We couldn’t find that order.</h3><p>It may belong to another account or the link may be out of date.</p><Link className="button button--dark" href="/orders">Back to orders</Link></div>;
  const statusIndex = order.status === "cancelled" ? -1 : orderStatusSteps.findIndex(step => step.key === order.status);
  const trackingIndex = order.status === "cancelled" ? -1 : order.status === "delivered" ? 2 : order.status === "shipped" || order.status === "out_for_delivery" ? 1 : 0;
  const trackingPercent = [8, 54, 100][trackingIndex] ?? 0;
  const canCancel = order.status === "placed" || order.status === "confirmed";
  const formatPayment = (method: string) => ({ upi: "UPI", credit_card: "Credit card", debit_card: "Debit card", cod: "Cash on delivery" }[method] ?? method);
  return <AuthGate><div className="container order-detail-head"><Link className="back-link" href="/orders"><ChevronLeft size={16} /> All orders</Link><div className="order-detail-title"><div><span className="eyebrow">{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span><h1>Order details.</h1></div><span className={`status-pill status-pill--${order.status}`}><Check size={13} /> {order.status.replaceAll("_", " ")}</span></div></div><main className="container order-detail-layout"><section><div className="order-detail-panel order-timeline-panel"><div className="order-panel-heading"><div><span className="eyebrow">Delivery timeline</span><h2>{order.status === "cancelled" ? "Order cancelled" : order.expectedDelivery ? `Expected ${new Date(order.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "Tracking your order"}</h2></div><Truck size={20} /></div>{order.trackingNumber && order.trackingUrl && <a className="tracking-link-card" href={order.trackingUrl} target="_blank" rel="noreferrer"><span><Truck size={17} /><strong>{order.trackingCarrier || "External carrier"}</strong><small>Tracking number {order.trackingNumber}</small></span><ArrowUpRight size={15} /></a>}{order.status !== "cancelled" && <div className="tracking-progress" aria-label={`Order tracking: ${trackingStages[trackingIndex]?.label ?? "Processing"}`}><div className="tracking-progress-line"><span style={{ width: `${trackingPercent}%` }} /></div>{trackingStages.map((stage, index) => <div className={`tracking-stage ${index <= trackingIndex ? "is-complete" : ""} ${index === trackingIndex ? "is-current" : ""}`} aria-current={index === trackingIndex ? "step" : undefined} key={stage.key}><span className="tracking-stage-dot">{index <= trackingIndex ? <Check size={12} /> : index + 1}</span><div><strong>{stage.label}</strong><span>{index === trackingIndex ? stage.note : index < trackingIndex ? "Completed" : "Up next"}</span></div></div>)}</div>}{order.status === "cancelled" ? <div className="cancelled-callout"><Ban size={18} /><div><strong>This order was cancelled.</strong><span>{order.cancelReason ?? "Cancelled by customer"}{order.cancelledAt ? ` · ${new Date(order.cancelledAt).toLocaleDateString("en-IN")}` : ""}</span></div></div> : <div className="order-timeline">{orderStatusSteps.map((step, index) => <div className={`timeline-step ${index <= statusIndex ? "is-complete" : ""} ${index === statusIndex ? "is-current" : ""}`} key={step.key}><span className="timeline-dot">{index <= statusIndex ? <Check size={12} /> : index + 1}</span><div><strong>{step.label}</strong><span>{index <= statusIndex ? (index === statusIndex ? step.note : "Completed") : step.note}</span></div></div>)}</div>}{trackingEvents.length > 0 && <div className="tracking-events"><div className="tracking-events-heading"><span className="eyebrow">Tracking updates</span><span>{trackingEvents.length} event{trackingEvents.length === 1 ? "" : "s"}</span></div>{trackingEvents.slice().reverse().map((event: any) => <div className="tracking-event" key={`${event.id}-${event.createdAt}`}><span className={`tracking-event-dot tracking-event-dot--${event.status}`}><Check size={11} /></span><div><strong>{event.title}</strong><span>{event.description}</span></div><time dateTime={new Date(event.createdAt).toISOString()}>{new Date(event.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</time></div>)}</div>}</div><div className="order-detail-panel"><div className="order-panel-heading"><div><span className="eyebrow">Items in this order</span><h2>{order.items.length} product{order.items.length > 1 ? "s" : ""}</h2></div><button className="text-link" onClick={() => reorder.mutate({ orderNumber })} disabled={reorder.isPending}><RefreshCw size={14} /> {reorder.isPending ? "Adding…" : "Buy again"}</button></div><div className="order-detail-items">{order.items.map((item: any) => <div className="order-detail-item" key={item.id}><img src={item.image ?? FALLBACK_IMAGE} alt="" /><div className="order-detail-item-copy"><strong>{item.productName}</strong><span>{item.vendorName} · Qty {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div><div className="order-item-actions">{item.reviewed ? <span className="reviewed-label"><Check size={13} /> Reviewed</span> : <button className="text-link" onClick={() => setReviewingProductId(item.productId)}><Star size={14} /> Rate item</button>}<Link className="text-link" href={`/products?search=${encodeURIComponent(item.productName)}`}>View similar <ArrowUpRight size={13} /></Link></div>{reviewingProductId === item.productId && <ReviewForm product={{ id: item.productId, name: item.productName }} onDone={() => { setReviewingProductId(null); void utils.orders.get.invalidate({ orderNumber }); }} />}</div>)}</div></div></section><aside className="order-detail-aside"><div className="order-detail-panel order-actions-panel"><span className="eyebrow">Manage order</span><h2>Need to make a change?</h2><button className="order-action-button" onClick={() => window.print()}><FileText size={17} /><span><strong>Print receipt</strong><small>Save a clean copy for your records.</small></span><ArrowUpRight size={14} /></button>{canCancel && <button className="order-action-button order-action-button--danger" onClick={() => setCancelOpen(true)}><Ban size={17} /><span><strong>Cancel order</strong><small>Available before packing starts.</small></span><ArrowUpRight size={14} /></button>}<a className="order-action-button" href={`mailto:care@grabzo.example?subject=Help with ${order.orderNumber}`}><MessageCircle size={17} /><span><strong>Get help</strong><small>Contact care about this order.</small></span><ArrowUpRight size={14} /></a></div><div className="order-detail-panel order-payment-panel"><span className="eyebrow">Payment & delivery</span><div><small>Payment</small><strong>{formatPayment(order.paymentMethod)}</strong><span className={order.paymentStatus === "completed" ? "payment-complete" : "payment-pending"}>{order.paymentStatus === "completed" ? `Completed · ${order.paymentReference}` : "Pending · due at delivery"}</span></div><div><small>Delivering to</small><strong>{order.address.name}</strong><span>{order.address.house}, {order.address.street}<br />{order.address.city}, {order.address.state} · {order.address.pincode}</span></div><div className="order-total-row"><span>Total paid</span><strong>{money(order.total)}</strong></div></div></aside></main><ReturnRequestPanel order={order} />{cancelOpen && <div className="action-modal-backdrop" role="presentation" onClick={() => setCancelOpen(false)}><div className="action-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" onClick={event => event.stopPropagation()}><button className="icon-button action-modal-close" onClick={() => setCancelOpen(false)} aria-label="Close cancellation dialog"><X size={18} /></button><div className="action-modal-icon"><Ban size={21} /></div><span className="eyebrow">Cancel order {order.orderNumber}</span><h2 id="cancel-order-title">Are you sure?</h2><p>This action cannot be undone. Your payment status and refund guidance will be updated with the order record.</p><label>Reason <textarea value={cancelReason} onChange={event => setCancelReason(event.target.value)} maxLength={500} rows={3} placeholder="Optional: tell us why you’re cancelling." /></label><div className="action-modal-actions"><button className="button button--light" onClick={() => setCancelOpen(false)}>Keep order</button><button className="button button--danger" disabled={cancel.isPending} onClick={() => cancel.mutate({ orderNumber, reason: cancelReason })}>{cancel.isPending ? "Cancelling…" : "Cancel order"}</button></div></div></div>}</AuthGate>;
}

function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const { data: orders = [], isLoading } = trpc.orders.list.useQuery(undefined, { enabled: isAuthenticated });
  const [location] = useLocation();
  const formatPayment = (method: string) => ({ upi: "UPI", credit_card: "Credit card", debit_card: "Debit card", cod: "Cash on delivery" }[method] ?? method);
  const successNumber = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? "").get("success");
  const successOrder = successNumber ? orders.find((order: any) => order.orderNumber === successNumber) : null;
  return <AuthGate><PageIntro eyebrow="Your Grabzo account" title="Your orders." description={successOrder ? "Your order is confirmed. Here’s everything you need to know." : "Keep track of every good decision."} />{successOrder && <div className="container order-success-banner"><div className="order-success-icon"><Check size={23} /></div><div><span className="eyebrow">Order confirmed · {successOrder.orderNumber}</span><h2>{successOrder.paymentStatus === "completed" ? "Payment completed successfully." : "Cash on delivery selected."}</h2><p>{successOrder.paymentStatus === "completed" ? `${formatPayment(successOrder.paymentMethod)} payment received. Reference ${successOrder.paymentReference}.` : `Your ${money(successOrder.total)} payment is due when your order arrives.`}</p></div><Link className="button button--dark" href={`/order/${successOrder.orderNumber}`}>Manage order <ArrowUpRight size={15} /></Link></div>}<div className="container orders-list">{isLoading ? <LoadingGrid /> : orders.length ? orders.map((order: any) => <div className={`order-card order-card--${order.status}`} key={order.id}><div className="order-card-top"><div><span className="eyebrow">{order.orderNumber}</span><strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div><span className={`status-pill status-pill--${order.status}`}><Check size={13} /> {order.status.replaceAll("_", " ")}</span></div><div className="order-card-items">{order.items.map((item: any) => <div key={item.id}><img src={item.image ?? FALLBACK_IMAGE} alt="" /><span>{item.productName}</span><small>Qty {item.quantity}</small></div>)}</div><div className="order-card-payment"><div><span className="eyebrow">Payment</span><strong>{formatPayment(order.paymentMethod)}</strong><small className={order.paymentStatus === "completed" ? "payment-complete" : "payment-pending"}>{order.paymentStatus === "completed" ? `Completed · ${order.paymentReference}` : "Pending · due at delivery"}</small></div><div><span className="eyebrow">Delivering to</span><strong>{order.address?.city ?? "Your address"}{order.address?.pincode ? ` · ${order.address.pincode}` : ""}</strong><small>{order.address?.name ?? "Grabzo shopper"}</small></div></div><div className="order-card-bottom"><span>Expected delivery <strong>{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Soon"}</strong></span><strong>{money(order.total)}</strong><Link className="text-link" href={`/order/${order.orderNumber}`}>Manage order <ArrowUpRight size={14} /></Link></div></div>) : <div className="empty-state"><Package size={30} /><h3>No orders yet.</h3><p>When you find something good, it will live here.</p><Link className="button button--dark" href="/products">Start exploring</Link></div>}</div></AuthGate>;
}


function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => { void utils.notifications.list.invalidate(); void utils.notifications.unreadCount.invalidate(); } });
  return <AuthGate><PageIntro eyebrow="Your Grabzo updates" title="Stay in the know." description="Shipment milestones, order confirmations, and review reminders in one place." action={notifications.some((notification: any) => notification.status === "unread") ? <button className="button button--dark" onClick={() => markRead.mutate({})} disabled={markRead.isPending}>{markRead.isPending ? "Marking read…" : "Mark all read"}</button> : undefined} /><div className="container notifications-list">{isLoading ? <LoadingGrid /> : notifications.length ? notifications.map((notification: any) => <button className={`notification-row ${notification.status === "unread" ? "is-unread" : ""}`} key={notification.id} onClick={() => { if (notification.status === "unread") markRead.mutate({ notificationId: notification.id }); if (notification.actionUrl) window.location.href = notification.actionUrl; }}><span className={`notification-icon notification-icon--${notification.type}`}><Bell size={17} /></span><span className="notification-copy"><strong>{notification.title}</strong><span>{notification.body}</span><small>{new Date(notification.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</small></span><ArrowUpRight size={15} /></button>) : <div className="empty-state"><Bell size={28} /><h3>You’re all caught up.</h3><p>New order and shipment updates will appear here.</p><Link className="button button--dark" href="/orders">View orders</Link></div>}</div></AuthGate>;
}

function WishlistPage({ allProducts, onAdd, onWishlist, wishedIds }: { allProducts: any[]; onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[] }) {
  const { isAuthenticated } = useAuth();
  const { data: serverWishlist = [] } = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const products = isAuthenticated ? serverWishlist.map((entry: any) => entry.product) : allProducts.filter(product => wishedIds.includes(product.id));
  return <><PageIntro eyebrow="Saved for later" title="Your wishlist." description="The pieces you keep coming back to." /><div className="container"><ProductGrid products={products} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} empty="Your wishlist is still a blank page." /></div></>;
}

function ShipmentConsole({ admin }: { admin: boolean }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: shipments = [], isLoading } = trpc.dashboard.shipments.useQuery(undefined, { enabled: isAuthenticated });
  const update = trpc.dashboard.updateShipment.useMutation({ onSuccess: () => { toast.success("Shipment status updated."); void utils.dashboard.shipments.invalidate(); }, onError: error => toast.error(error.message) });
  const nextStatuses = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
  const [drafts, setDrafts] = useState<Record<number, { carrier: string; number: string; url: string }>>({});
  const getDraft = (shipment: any) => drafts[shipment.id] ?? { carrier: shipment.trackingCarrier ?? "", number: shipment.trackingNumber ?? "", url: shipment.trackingUrl ?? "" };
  return <div className="dashboard-panel shipment-console"><div className="dashboard-panel-top"><div><span className="eyebrow">Fulfillment control</span><h2>{admin ? "All shipment updates" : "Your shipment queue"}</h2></div><Truck size={18} /></div>{isLoading ? <div className="shipment-console-loading"><div className="spinner" /></div> : shipments.length ? <div className="shipment-table">{shipments.slice(0, 12).map((shipment: any) => { const draft = getDraft(shipment); return <div className="shipment-row" key={shipment.id}><div><strong>{shipment.orderNumber}</strong><span>{shipment.items.map((item: any) => item.productName).join(" · ")}</span><small>{shipment.address?.city ?? "Customer address"} · {shipment.status.replaceAll("_", " ")}</small></div><div className="shipment-controls"><label><span className="eyebrow">Update status</span><select value={shipment.status} disabled={update.isPending || shipment.status === "delivered" || shipment.status === "cancelled"} onChange={event => update.mutate({ orderNumber: shipment.orderNumber, status: event.target.value as "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered", trackingCarrier: draft.carrier, trackingNumber: draft.number, trackingUrl: draft.url || undefined })}>{nextStatuses.map(status => <option value={status} disabled={nextStatuses.indexOf(status) <= nextStatuses.indexOf(shipment.status)} key={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label><span className="eyebrow">Carrier</span><input value={draft.carrier} placeholder="Delhivery" onChange={event => setDrafts(current => ({ ...current, [shipment.id]: { ...draft, carrier: event.target.value } }))} /></label><label><span className="eyebrow">Tracking number</span><input value={draft.number} placeholder="AWB / tracking ID" onChange={event => setDrafts(current => ({ ...current, [shipment.id]: { ...draft, number: event.target.value } }))} /></label><label><span className="eyebrow">Tracking URL</span><input type="url" value={draft.url} placeholder="https://carrier.com/track" onChange={event => setDrafts(current => ({ ...current, [shipment.id]: { ...draft, url: event.target.value } }))} /></label><button className="button button--dark shipment-save-tracking" disabled={update.isPending || shipment.status === "cancelled" || shipment.status === "placed"} onClick={() => update.mutate({ orderNumber: shipment.orderNumber, status: shipment.status as "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered", trackingCarrier: draft.carrier, trackingNumber: draft.number, trackingUrl: draft.url || undefined })}>Save tracking</button></div></div>; })}</div> : <div className="shipment-empty"><Package size={22} /><span>No shipments need an update right now.</span></div>}</div>;
}

function ReturnReviewConsole() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: returns = [], isLoading } = trpc.dashboard.returns.useQuery(undefined, { enabled: isAuthenticated });
  const [notes, setNotes] = useState<Record<number, string>>({});
  const review = trpc.dashboard.reviewReturn.useMutation({ onSuccess: () => { toast.success("Return updated."); void utils.dashboard.returns.invalidate(); }, onError: error => toast.error(error.message) });
  const actionFor = (status: string) => status === "requested" ? ["approved", "rejected"] : status === "approved" ? ["received"] : status === "received" ? ["refunded"] : [];
  return <div className="dashboard-panel return-review-console"><div className="dashboard-panel-top"><div><span className="eyebrow">Returns desk</span><h2>Review customer returns</h2></div><RefreshCw size={18} /></div>{isLoading ? <div className="shipment-console-loading"><div className="spinner" /></div> : returns.length ? <div className="return-review-list">{returns.slice(0, 20).map((item: any) => <div className="return-review-row" key={item.id}><div className="return-review-copy"><strong>{item.order?.orderNumber ?? `Return #${item.id}`}</strong><span>{item.reason} · Refund requested {money(item.refundAmount)}</span><small>{item.items?.map((entry: any) => `${entry.productName} × ${entry.quantity}`).join(" · ")}</small>{item.customerNote && <small>Customer note: {item.customerNote}</small>}</div><div className="return-review-actions"><span className={`return-status return-status--${item.status}`}>{item.status}</span>{actionFor(item.status).length > 0 && <><input value={notes[item.id] ?? ""} onChange={event => setNotes(current => ({ ...current, [item.id]: event.target.value }))} placeholder="Seller note (optional)" maxLength={1000} />{actionFor(item.status).map(action => <button className={action === "rejected" ? "button button--light" : "button button--dark"} disabled={review.isPending} onClick={() => review.mutate({ returnId: item.id, status: action as "approved" | "rejected" | "received" | "refunded", sellerNote: notes[item.id] })} key={action}>{action === "refunded" ? "Issue refund" : action.charAt(0).toUpperCase() + action.slice(1)}</button>)}</>}</div></div>)}</div> : <div className="shipment-empty"><Package size={22} /><span>No return requests need review.</span></div>}</div>;
}

function DashboardPage({ admin = false }: { admin?: boolean }) {
  const { user, isAuthenticated } = useAuth();
  const canViewVendor = user?.role === "vendor" || user?.role === "admin";
  const canView = admin ? user?.role === "admin" : canViewVendor;
  const { data: vendorStats } = trpc.dashboard.vendorStats.useQuery(undefined, { enabled: isAuthenticated && !admin && canViewVendor });
  const { data: adminStats } = trpc.dashboard.adminOverview.useQuery(undefined, { enabled: isAuthenticated && admin && user?.role === "admin" });
  if (isAuthenticated && !canView) return <div className="auth-gate"><div className="auth-gate-icon"><ShieldCheck size={26} /></div><span className="eyebrow">Restricted workspace</span><h1>{admin ? "Admin access only." : "Seller access only."}</h1><p>Your current Grabzo account can shop, save, and manage its own orders, but cannot access this workspace.</p><Link className="button button--dark" href="/account">Back to account <ArrowRight size={16} /></Link></div>;
  const stats = admin ? [{ label: "Total users", value: adminStats?.users ?? 0, icon: UserRound }, { label: "Active vendors", value: adminStats?.vendors ?? 0, icon: Store }, { label: "Products", value: adminStats?.products ?? 0, icon: Package }, { label: "Orders", value: adminStats?.orders ?? 0, icon: ShoppingBag }, { label: "Revenue", value: money(adminStats?.revenue ?? 0), icon: BarChart3 }] : [{ label: "Total sales", value: money(vendorStats?.totalSales ?? 0), icon: BarChart3 }, { label: "Orders", value: vendorStats?.orders ?? 0, icon: ShoppingBag }, { label: "Products", value: vendorStats?.products ?? 0, icon: Package }, { label: "Customers", value: vendorStats?.customers ?? 0, icon: UserRound }, { label: "Revenue", value: money(vendorStats?.revenue ?? 0), icon: WalletCards }];
  return <AuthGate title={`Welcome back, ${user?.name?.split(" ")[0] ?? "seller"}.`}><div className="dashboard-shell"><aside className="dashboard-sidebar"><Logo compact /><span className="eyebrow">{admin ? "Marketplace admin" : "Seller studio"}</span><nav><Link href={admin ? "/admin" : "/seller"} className="is-active"><LayoutDashboard size={16} /> Overview</Link><Link href="/products"><Package size={16} /> Products</Link><Link href="/orders"><ShoppingBag size={16} /> Orders</Link><Link href="/vendors"><Store size={16} /> Store profile</Link></nav><div className="dashboard-sidebar-foot"><Sparkles size={15} /><span>Make something people want to live with.</span></div></aside><main className="dashboard-main"><div className="dashboard-header"><div><span className="eyebrow">{admin ? "Admin overview" : "Seller overview"}</span><h1>Good morning, {user?.name?.split(" ")[0] ?? "there"}.</h1></div><button className="button button--dark" onClick={() => toast.success(admin ? "Promotion studio is ready for your next campaign." : "Product editor is ready for your next listing.")}>{admin ? "Create promotion" : "Add product"} <Plus size={16} /></button></div><div className="dashboard-stat-grid">{stats.map(({ label, value, icon: Icon }) => <div className="dashboard-stat" key={label}><Icon size={19} /><span>{label}</span><strong>{value}</strong><small>{label === "Revenue" ? "Across the marketplace" : "Updated just now"}</small></div>)}</div><ShipmentConsole admin={admin} /><ReturnReviewConsole /><div className="dashboard-content-grid"><div className="dashboard-panel dashboard-chart"><div className="dashboard-panel-top"><div><span className="eyebrow">Performance</span><h2>{admin ? "Revenue overview" : "Sales over time"}</h2></div><span className="dashboard-period">Last 30 days <ChevronDown size={14} /></span></div><div className="fake-chart"><div className="chart-gridlines"><span /><span /><span /><span /></div><svg viewBox="0 0 720 220" preserveAspectRatio="none" aria-label="Performance chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6f35f5" stopOpacity=".28" /><stop offset="100%" stopColor="#6f35f5" stopOpacity="0" /></linearGradient></defs><path d="M0 180 C55 166, 72 134, 130 148 S205 165, 260 108 S325 92, 365 122 S440 142, 488 74 S550 50, 590 92 S665 68, 720 28 L720 220 L0 220 Z" fill="url(#chartFill)" /><path d="M0 180 C55 166, 72 134, 130 148 S205 165, 260 108 S325 92, 365 122 S440 142, 488 74 S550 50, 590 92 S665 68, 720 28" fill="none" stroke="#6f35f5" strokeWidth="4" strokeLinecap="round" /></svg><div className="chart-labels"><span>1 Jun</span><span>8 Jun</span><span>15 Jun</span><span>22 Jun</span><span>30 Jun</span></div></div></div><div className="dashboard-panel dashboard-activity"><div className="dashboard-panel-top"><div><span className="eyebrow">Latest activity</span><h2>What needs you.</h2></div><ArrowUpRight size={17} /></div>{[["Order placed", "WH-1000XM5 · #GZ-7A92", "2 min ago"], ["New review", "A happy customer at TechNova", "28 min ago"], ["Stock alert", "Only 9 Arc Table Lamps left", "1 hr ago"], ["Payout ready", "₹24,890 available to withdraw", "Yesterday"]].map(([title, detail, time], index) => <div className="activity-row" key={title}><span className={`activity-icon activity-icon--${index}`}><Check size={14} /></span><div><strong>{title}</strong><span>{detail}</span></div><small>{time}</small></div>)}</div></div></main></div></AuthGate>;
}

export default function Home() {
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const guest = useGuestCart();
  const { isAuthenticated } = useAuth();
  const { data: homeProducts = [] } = trpc.catalog.products.useQuery({ featured: true, limit: 8 });
  const { data: allProducts = [] } = trpc.catalog.products.useQuery({ limit: 60 });
  const { data: categories = [] } = trpc.catalog.categories.useQuery();
  const { data: vendors = [] } = trpc.catalog.vendors.useQuery();
  const { data: deals = [] } = trpc.catalog.products.useQuery({ deal: true, limit: 8 });
  const { data: serverWishlist = [] } = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const wishedIds = isAuthenticated ? serverWishlist.map((entry: any) => entry.product.id) : (() => { try { return JSON.parse(localStorage.getItem("grabzo-wishlist") ?? "[]"); } catch { return []; } })();
  const addCart = trpc.cart.add.useMutation({ onSuccess: () => toast.success("Added to your bag.") });
  const wishlist = trpc.wishlist.toggle.useMutation({ onSuccess: () => toast.success("Wishlist updated.") });
  const addToCart = (product: any) => { if (isAuthenticated) addCart.mutate({ productId: product.id, quantity: 1 }); else { guest.add(product); toast.success("Added to your bag."); } };
  const toggleWishlist = (product: any) => { if (isAuthenticated) wishlist.mutate({ productId: product.id }); else { const next = wishedIds.includes(product.id) ? wishedIds.filter((id: number) => id !== product.id) : [...wishedIds, product.id]; localStorage.setItem("grabzo-wishlist", JSON.stringify(next)); toast.success(next.includes(product.id) ? "Saved to wishlist." : "Removed from wishlist."); window.dispatchEvent(new Event("storage")); } };
  const cartCount = isAuthenticated ? undefined : guest.count;
  const commonProps = { onAdd: addToCart, onWishlist: toggleWishlist, wishedIds };
  let page: React.ReactNode;
  const path = location.split("?")[0];
  if (path === "/") return <LoginLanding />;
  if (path === "/products") page = <ProductsPage {...commonProps} />;
  else if (path.startsWith("/product/")) page = <ProductPage {...commonProps} />;
  else if (path === "/vendors") page = <VendorsPage />;
  else if (path.startsWith("/store/")) page = <VendorPage {...commonProps} />;
  else if (path === "/cart") page = <CartPage guest={guest.lines} onUpdateGuest={guest.update} onClearGuest={guest.clear} onAdd={addToCart} onLogin={() => startLogin()} />;
  else if (path === "/checkout") page = <CheckoutPage guest={guest.lines} clearGuest={guest.clear} />;
  else if (path.startsWith("/order/")) page = <OrderDetailPage />;
  else if (path === "/orders") page = <OrdersPage />;
  else if (path === "/notifications") page = <NotificationsPage />;
  else if (path === "/account") page = <AccountPage />;
  else if (path === "/wishlist") page = <WishlistPage allProducts={allProducts} onAdd={addToCart} onWishlist={toggleWishlist} wishedIds={wishedIds} />;
  else if (path === "/seller") page = <DashboardPage />;
  else if (path === "/admin") page = <DashboardPage admin />;
  else page = <HomePage products={homeProducts} categories={categories} vendors={vendors} deals={deals} onAdd={addToCart} onWishlist={toggleWishlist} wishedIds={wishedIds} />;
  return <div className="app-shell"><BrandIntro /><Header cartCount={cartCount ?? 0} onMenu={() => setMenuOpen(true)} query={query} setQuery={setQuery} /><MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} /><main>{page}</main><Footer /></div>;
}
