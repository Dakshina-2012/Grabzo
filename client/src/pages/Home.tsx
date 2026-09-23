import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Filter,
  Heart,
  House,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
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

function Header({ cartCount, onMenu, query, setQuery }: { cartCount: number; onMenu: () => void; query: string; setQuery: (value: string) => void }) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); navigate(`/products${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`); };
  return <>
    <header className="site-header">
      <div className="container header-inner">
        <button className="icon-button mobile-only" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button>
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/products">Explore</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/products?deal=true">Deals</Link>
          <Link href="/products?sort=newest">New arrivals</Link>
        </nav>
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={17} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, brands, sellers" aria-label="Search products" />
          {query && <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
        </form>
        <div className="header-actions">
          <Link href="/wishlist" className="header-action" aria-label="Wishlist"><Heart size={19} /><span className="desktop-only">Wishlist</span></Link>
          <Link href="/cart" className="header-action cart-action" aria-label="Cart"><ShoppingBag size={19} /><span className="desktop-only">Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</Link>
          <Link href={isAuthenticated ? "/orders" : "/account"} className="header-action account-action" aria-label="Account"><CircleUserRound size={20} /><span className="desktop-only">{user?.name?.split(" ")[0] ?? "Account"}</span></Link>
        </div>
      </div>
    </header>
    <div className="shipping-strip"><div className="container shipping-strip-inner"><span><Sparkles size={13} /> Curated from 250+ independent sellers</span><span className="desktop-only">Free delivery on orders over ₹1,999</span><span className="desktop-only">Shop More <span className="dot">•</span> Live Better</span></div></div>
  </>;
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div className="mobile-menu-backdrop" onClick={onClose}><aside className="mobile-menu" onClick={event => event.stopPropagation()}><div className="mobile-menu-top"><Logo compact /><button className="icon-button" onClick={onClose} aria-label="Close menu"><X size={20} /></button></div><div className="mobile-menu-links"><Link href="/products" onClick={onClose}>Explore <ArrowUpRight size={16} /></Link><Link href="/vendors" onClick={onClose}>Vendors <ArrowUpRight size={16} /></Link><Link href="/products?deal=true" onClick={onClose}>Deals <ArrowUpRight size={16} /></Link><Link href="/orders" onClick={onClose}>My orders <ArrowUpRight size={16} /></Link><Link href="/wishlist" onClick={onClose}>Wishlist <ArrowUpRight size={16} /></Link></div><div className="mobile-menu-note"><span className="eyebrow">The Grabzo edit</span><p>Products with a point of view, from sellers worth knowing.</p></div></aside></div>;
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
  const params = useMemo(() => new URLSearchParams(location.split("?")[1] ?? ""), [location]);
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState<any>(params.get("sort") ?? "relevance");
  const { data: categories = [] } = trpc.catalog.categories.useQuery();
  const { data: vendors = [] } = trpc.catalog.vendors.useQuery();
  const { data: products = [], isLoading } = trpc.catalog.products.useQuery({ search: search || undefined, category: category || undefined, sort, deal: params.get("deal") === "true", featured: params.get("featured") === "true", limit: 60 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  return <><PageIntro eyebrow="The marketplace edit" title={params.get("deal") === "true" ? "Deals worth grabbing." : "Products with a point of view."} description="Explore a more considered way to shop — across independent sellers, modern essentials, and the things you didn't know you needed." action={<span className="result-count">{products.length} products</span>} /><div className="container products-layout"><aside className={`filter-sidebar ${filtersOpen ? "filter-sidebar--open" : ""}`}><div className="filter-top"><span className="eyebrow">Refine</span><button className="icon-button mobile-only" onClick={() => setFiltersOpen(false)}><X size={18} /></button></div><label className="filter-label">Search<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Try headphones" /></label><div className="filter-group"><span className="filter-label">Category</span><button className={!category ? "filter-option is-active" : "filter-option"} onClick={() => setCategory("")}>All products <span>({products.length})</span></button>{categories.map((item: any) => <button className={category === item.name ? "filter-option is-active" : "filter-option"} onClick={() => setCategory(item.name)} key={item.id}>{item.name}</button>)}</div><div className="filter-group"><span className="filter-label">Seller</span>{vendors.slice(0, 5).map((vendor: any) => <button className="filter-option" onClick={() => setSearch(vendor.name)} key={vendor.id}>{vendor.name}</button>)}</div><button className="text-link filter-reset" onClick={() => { setSearch(""); setCategory(""); setSort("relevance"); }}>Reset filters <X size={14} /></button></aside><main className="products-main"><div className="products-toolbar"><button className="filter-trigger mobile-only" onClick={() => setFiltersOpen(true)}><Filter size={16} /> Filters</button><span className="desktop-only">Showing {products.length} results</span><label className="sort-select">Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="relevance">Relevance</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option><option value="rating">Top rated</option></select><ChevronDown size={14} /></label></div>{isLoading ? <LoadingGrid /> : <ProductGrid products={products} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} empty="No products matched that edit." />}</main></div></>;
}

function LoadingGrid() { return <div className="product-grid">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton-card" key={index}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line skeleton-line--short" /></div>)}</div>; }

function ProductPage({ onAdd, onWishlist, wishedIds }: { onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[] }) {
  const [location] = useLocation();
  const slug = location.split("/product/")[1]?.split("?")[0] ?? "";
  const { data: product, isLoading } = trpc.catalog.bySlug.useQuery({ slug });
  const { data: reviews = [] } = trpc.reviews.list.useQuery({ productId: product?.id ?? 0 }, { enabled: Boolean(product?.id) });
  const [activeImage, setActiveImage] = useState(0);
  if (isLoading) return <div className="container loading-page"><LoadingGrid /></div>;
  if (!product) return <div className="container empty-state page-empty"><Package size={28} /><h3>That product has moved on.</h3><Link className="button button--dark" href="/products">Back to products</Link></div>;
  return <><div className="container breadcrumb"><Link href="/products">Products</Link><ChevronRight size={14} /><span>{product.category}</span><ChevronRight size={14} /><span>{product.name}</span></div><section className="container product-detail"><div className="gallery"><div className="gallery-main"><img src={imageOf(product, activeImage)} alt={product.name} /><span className="gallery-count">0{activeImage + 1} / 0{product.images.length}</span></div><div className="gallery-thumbs">{product.images.map((image: string, index: number) => <button className={activeImage === index ? "gallery-thumb is-active" : "gallery-thumb"} onClick={() => setActiveImage(index)} key={image}><img src={image} alt="" /></button>)}</div></div><div className="product-detail-copy"><span className="eyebrow">{product.category} · {product.brand}</span><h1>{product.name}</h1><div className="detail-rating"><span><Star size={14} fill="currentColor" /> {rating(product.rating)}</span><span>{product.reviewCount} reviews</span><span className="verified-dot"><Check size={12} /> Verified</span></div><div className="detail-price"><strong>{money(product.price)}</strong><s>{money(product.originalPrice)}</s><span>{product.discount}% off</span></div><p className="detail-description">{product.description}</p><div className="detail-stock"><span className="stock-good">● In stock</span><span>Ships from {product.vendorName}</span></div><div className="detail-actions"><button className="button button--primary button--large" onClick={() => onAdd(product)}>Add to bag <ShoppingBag size={17} /></button><button className={`wishlist-detail ${wishedIds.includes(product.id) ? "is-wished" : ""}`} onClick={() => onWishlist(product)}><Heart size={18} fill={wishedIds.includes(product.id) ? "currentColor" : "none"} /> {wishedIds.includes(product.id) ? "Saved" : "Save"}</button></div><div className="detail-service"><div><Truck size={18} /><span><strong>Free delivery</strong> on orders over ₹1,999</span></div><div><ShieldCheck size={18} /><span><strong>Easy returns</strong> within 7 days</span></div><div><Store size={18} /><span>Sold by <Link href={`/store/${product.vendorName.toLowerCase().replace(/\s+/g, "")}`}>{product.vendorName}</Link></span></div></div><div className="detail-specs"><span className="eyebrow">Details</span>{Object.entries(product.specifications ?? {}).map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}</div><div className="detail-reviews"><div className="reviews-heading"><span className="eyebrow">What people say</span><strong><Star size={14} fill="currentColor" /> {rating(product.rating)}</strong></div>{reviews.length ? reviews.slice(0, 3).map((review: any) => <div className="review-row" key={review.id}><div className="review-stars">{"★".repeat(review.rating)}<span>{"★".repeat(5 - review.rating)}</span></div><strong>{review.title}</strong><p>{review.body}</p><span>{review.userName} · Verified purchase</span></div>) : <p className="muted-copy">First to leave a review for this product.</p>}</div></div></section></>;
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

function OrdersPage() {
  const { data: orders = [], isLoading } = trpc.orders.list.useQuery(undefined, { enabled: useAuth().isAuthenticated });
  const [location] = useLocation();
  return <AuthGate><PageIntro eyebrow="Your Grabzo account" title="Your orders." description={location.includes("success=") ? "Your order is on its way to becoming part of your everyday." : "Keep track of every good decision."} /> <div className="container orders-list">{isLoading ? <LoadingGrid /> : orders.length ? orders.map((order: any) => <div className="order-card" key={order.id}><div className="order-card-top"><div><span className="eyebrow">{order.orderNumber}</span><strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div><span className="status-pill"><Check size={13} /> {order.status.replaceAll("_", " ")}</span></div><div className="order-card-items">{order.items.map((item: any) => <div key={item.id}><img src={item.image ?? FALLBACK_IMAGE} alt="" /><span>{item.productName}</span><small>Qty {item.quantity}</small></div>)}</div><div className="order-card-bottom"><span>Expected delivery <strong>{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Soon"}</strong></span><strong>{money(order.total)}</strong><Link className="text-link" href={`/product/${order.items[0]?.productId ?? ""}`}>View details <ArrowUpRight size={14} /></Link></div></div>) : <div className="empty-state"><Package size={30} /><h3>No orders yet.</h3><p>When you find something good, it will live here.</p><Link className="button button--dark" href="/products">Start exploring</Link></div>}</div></AuthGate>;
}

function WishlistPage({ allProducts, onAdd, onWishlist, wishedIds }: { allProducts: any[]; onAdd: (product: any) => void; onWishlist: (product: any) => void; wishedIds: number[] }) {
  const { isAuthenticated } = useAuth();
  const { data: serverWishlist = [] } = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const products = isAuthenticated ? serverWishlist.map((entry: any) => entry.product) : allProducts.filter(product => wishedIds.includes(product.id));
  return <><PageIntro eyebrow="Saved for later" title="Your wishlist." description="The pieces you keep coming back to." /><div className="container"><ProductGrid products={products} onAdd={onAdd} onWishlist={onWishlist} wishedIds={wishedIds} empty="Your wishlist is still a blank page." /></div></>;
}

function DashboardPage({ admin = false }: { admin?: boolean }) {
  const { user, isAuthenticated } = useAuth();
  const { data: vendorStats } = trpc.dashboard.vendorStats.useQuery(undefined, { enabled: isAuthenticated && !admin });
  const { data: adminStats } = trpc.dashboard.adminOverview.useQuery(undefined, { enabled: isAuthenticated && admin });
  const stats = admin ? [{ label: "Total users", value: adminStats?.users ?? 0, icon: UserRound }, { label: "Active vendors", value: adminStats?.vendors ?? 0, icon: Store }, { label: "Products", value: adminStats?.products ?? 0, icon: Package }, { label: "Orders", value: adminStats?.orders ?? 0, icon: ShoppingBag }, { label: "Revenue", value: money(adminStats?.revenue ?? 0), icon: BarChart3 }] : [{ label: "Total sales", value: money(vendorStats?.totalSales ?? 0), icon: BarChart3 }, { label: "Orders", value: vendorStats?.orders ?? 0, icon: ShoppingBag }, { label: "Products", value: vendorStats?.products ?? 0, icon: Package }, { label: "Customers", value: vendorStats?.customers ?? 0, icon: UserRound }, { label: "Revenue", value: money(vendorStats?.revenue ?? 0), icon: WalletCards }];
  return <AuthGate title={`Welcome back, ${user?.name?.split(" ")[0] ?? "seller"}.`}><div className="dashboard-shell"><aside className="dashboard-sidebar"><Logo compact /><span className="eyebrow">{admin ? "Marketplace admin" : "Seller studio"}</span><nav><Link href={admin ? "/admin" : "/seller"} className="is-active"><LayoutDashboard size={16} /> Overview</Link><Link href="/products"><Package size={16} /> Products</Link><Link href="/orders"><ShoppingBag size={16} /> Orders</Link><Link href="/vendors"><Store size={16} /> Store profile</Link></nav><div className="dashboard-sidebar-foot"><Sparkles size={15} /><span>Make something people want to live with.</span></div></aside><main className="dashboard-main"><div className="dashboard-header"><div><span className="eyebrow">{admin ? "Admin overview" : "Seller overview"}</span><h1>Good morning, {user?.name?.split(" ")[0] ?? "there"}.</h1></div><button className="button button--dark" onClick={() => toast.success(admin ? "Promotion studio is ready for your next campaign." : "Product editor is ready for your next listing.")}>{admin ? "Create promotion" : "Add product"} <Plus size={16} /></button></div><div className="dashboard-stat-grid">{stats.map(({ label, value, icon: Icon }) => <div className="dashboard-stat" key={label}><Icon size={19} /><span>{label}</span><strong>{value}</strong><small>{label === "Revenue" ? "Across the marketplace" : "Updated just now"}</small></div>)}</div><div className="dashboard-content-grid"><div className="dashboard-panel dashboard-chart"><div className="dashboard-panel-top"><div><span className="eyebrow">Performance</span><h2>{admin ? "Revenue overview" : "Sales over time"}</h2></div><span className="dashboard-period">Last 30 days <ChevronDown size={14} /></span></div><div className="fake-chart"><div className="chart-gridlines"><span /><span /><span /><span /></div><svg viewBox="0 0 720 220" preserveAspectRatio="none" aria-label="Performance chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6f35f5" stopOpacity=".28" /><stop offset="100%" stopColor="#6f35f5" stopOpacity="0" /></linearGradient></defs><path d="M0 180 C55 166, 72 134, 130 148 S205 165, 260 108 S325 92, 365 122 S440 142, 488 74 S550 50, 590 92 S665 68, 720 28 L720 220 L0 220 Z" fill="url(#chartFill)" /><path d="M0 180 C55 166, 72 134, 130 148 S205 165, 260 108 S325 92, 365 122 S440 142, 488 74 S550 50, 590 92 S665 68, 720 28" fill="none" stroke="#6f35f5" strokeWidth="4" strokeLinecap="round" /></svg><div className="chart-labels"><span>1 Jun</span><span>8 Jun</span><span>15 Jun</span><span>22 Jun</span><span>30 Jun</span></div></div></div><div className="dashboard-panel dashboard-activity"><div className="dashboard-panel-top"><div><span className="eyebrow">Latest activity</span><h2>What needs you.</h2></div><ArrowUpRight size={17} /></div>{[["Order placed", "WH-1000XM5 · #GZ-7A92", "2 min ago"], ["New review", "A happy customer at TechNova", "28 min ago"], ["Stock alert", "Only 9 Arc Table Lamps left", "1 hr ago"], ["Payout ready", "₹24,890 available to withdraw", "Yesterday"]].map(([title, detail, time], index) => <div className="activity-row" key={title}><span className={`activity-icon activity-icon--${index}`}><Check size={14} /></span><div><strong>{title}</strong><span>{detail}</span></div><small>{time}</small></div>)}</div></div></main></div></AuthGate>;
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
  if (path === "/products") page = <ProductsPage {...commonProps} />;
  else if (path.startsWith("/product/")) page = <ProductPage {...commonProps} />;
  else if (path === "/vendors") page = <VendorsPage />;
  else if (path.startsWith("/store/")) page = <VendorPage {...commonProps} />;
  else if (path === "/cart") page = <CartPage guest={guest.lines} onUpdateGuest={guest.update} onClearGuest={guest.clear} onAdd={addToCart} onLogin={() => startLogin()} />;
  else if (path === "/checkout") page = <CheckoutPage guest={guest.lines} clearGuest={guest.clear} />;
  else if (path === "/orders" || path === "/account") page = <OrdersPage />;
  else if (path === "/wishlist") page = <WishlistPage allProducts={allProducts} onAdd={addToCart} onWishlist={toggleWishlist} wishedIds={wishedIds} />;
  else if (path === "/seller") page = <DashboardPage />;
  else if (path === "/admin") page = <DashboardPage admin />;
  else page = <HomePage products={homeProducts} categories={categories} vendors={vendors} deals={deals} onAdd={addToCart} onWishlist={toggleWishlist} wishedIds={wishedIds} />;
  return <div className="app-shell"><Header cartCount={cartCount ?? 0} onMenu={() => setMenuOpen(true)} query={query} setQuery={setQuery} /><MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} /><main>{page}</main><Footer /></div>;
}
