import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cartItems,
  categories,
  InsertUser,
  notifications,
  orderEvents,
  orderItems,
  orders,
  products,
  reviews,
  users,
  vendorFollows,
  vendors,
  wishlists,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

const categorySeed = [
  { slug: "electronics", name: "Electronics", eyebrow: "Sharper living", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=85", description: "Devices and tools that make every day feel a little more considered." },
  { slug: "fashion", name: "Fashion", eyebrow: "Wear your point of view", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85", description: "Modern layers, everyday essentials, and pieces with a point of view." },
  { slug: "beauty", name: "Beauty", eyebrow: "Small rituals, big feeling", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85", description: "Thoughtful formulas and objects for the ritual of taking care." },
  { slug: "home-living", name: "Home & Living", eyebrow: "Make space for good", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85", description: "Objects that bring intention, texture, and warmth home." },
  { slug: "sports", name: "Sports", eyebrow: "Move with intent", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85", description: "Gear for training days, long walks, and the in-between." },
  { slug: "books", name: "Books", eyebrow: "A world in your hands", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85", description: "Stories, ideas, and beautiful things to return to." },
];

const vendorSeed = [
  { slug: "technova", name: "TechNova", logo: "TN", coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85", description: "Future-facing tech, selected for the way you actually live.", rating: 48, reviewCount: 842, productCount: 128, categories: "Electronics, Computers", location: "Bengaluru, Karnataka", verified: true, followers: 12800, contact: "hello@technova.grabzo" },
  { slug: "urbannest", name: "UrbanNest", logo: "UN", coverImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=85", description: "Warm, useful objects for spaces that feel like you.", rating: 47, reviewCount: 618, productCount: 76, categories: "Home & Living, Kitchen", location: "Mumbai, Maharashtra", verified: true, followers: 8700, contact: "hello@urbannest.grabzo" },
  { slug: "styleaura", name: "StyleAura", logo: "SA", coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85", description: "A sharper edit of everyday fashion and quiet statements.", rating: 46, reviewCount: 492, productCount: 94, categories: "Fashion, Accessories", location: "New Delhi, Delhi", verified: true, followers: 10600, contact: "hello@styleaura.grabzo" },
  { slug: "homecraft", name: "HomeCraft", logo: "HC", coverImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85", description: "Crafted details for slow mornings and long evenings.", rating: 49, reviewCount: 307, productCount: 52, categories: "Home & Living", location: "Jaipur, Rajasthan", verified: true, followers: 5200, contact: "hello@homecraft.grabzo" },
  { slug: "fitforge", name: "FitForge", logo: "FF", coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85", description: "Performance essentials with no unnecessary noise.", rating: 47, reviewCount: 271, productCount: 45, categories: "Sports, Fitness", location: "Pune, Maharashtra", verified: true, followers: 4700, contact: "hello@fitforge.grabzo" },
  { slug: "glowlab", name: "GlowLab", logo: "GL", coverImage: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1600&q=85", description: "A considered shelf of modern skincare and self-care.", rating: 48, reviewCount: 552, productCount: 66, categories: "Beauty, Wellness", location: "Kochi, Kerala", verified: true, followers: 9200, contact: "hello@glowlab.grabzo" },
  { slug: "bookverse", name: "BookVerse", logo: "BV", coverImage: "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1600&q=85", description: "Books for curious minds and beautiful shelves.", rating: 49, reviewCount: 830, productCount: 240, categories: "Books, Stationery", location: "Kolkata, West Bengal", verified: true, followers: 13300, contact: "hello@bookverse.grabzo" },
  { slug: "gadgethub", name: "GadgetHub", logo: "GH", coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=85", description: "Useful tech finds, made easy to compare.", rating: 45, reviewCount: 381, productCount: 102, categories: "Electronics, Accessories", location: "Hyderabad, Telangana", verified: true, followers: 6300, contact: "hello@gadgethub.grabzo" },
];

const productSeed = [
  { slug: "sony-wh-1000xm5", name: "WH-1000XM5 Wireless Headphones", description: "Industry-leading noise cancellation and a beautifully balanced listening experience, tuned for long days and late nights.", price: 29999, originalPrice: 34990, discount: 14, category: "Electronics", subcategory: "Audio", brand: "Sony", vendorSlug: "technova", images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 268, stock: 24, sku: "TN-SONY-XM5", specifications: { "Battery": "Up to 30 hours", "Connectivity": "Bluetooth 5.2", "Warranty": "1 year" }, tags: ["wireless", "headphones", "sony"], isFeatured: true, isDeal: true },
  { slug: "kindle-paperwhite-16gb", name: "Kindle Paperwhite · 16 GB", description: "A glare-free, warm-lit display with enough space for your next small library.", price: 13999, originalPrice: 15999, discount: 13, category: "Electronics", subcategory: "Readers", brand: "Amazon", vendorSlug: "gadgethub", images: ["https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 194, stock: 17, sku: "GH-KINDLE-16", specifications: { "Display": "6.8 inch", "Storage": "16 GB", "Waterproof": "IPX8" }, tags: ["kindle", "books", "reading"], isFeatured: true, isDeal: false },
  { slug: "new-balance-327-sea-salt", name: "327 Sneakers · Sea Salt", description: "A retro runner shape with a clean, versatile profile for the everyday rotation.", price: 8999, originalPrice: 10999, discount: 18, category: "Fashion", subcategory: "Footwear", brand: "New Balance", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 127, stock: 33, sku: "SA-NB-327", specifications: { "Upper": "Suede & mesh", "Sole": "Rubber", "Fit": "True to size" }, tags: ["sneakers", "shoes", "new balance"], isFeatured: true, isDeal: true },
  { slug: "glow-lab-barrier-cream", name: "Barrier Repair Cream", description: "A rich but weightless daily moisturiser that leaves skin calm, supple, and ready for the day.", price: 1299, originalPrice: 1599, discount: 19, category: "Beauty", subcategory: "Skincare", brand: "GlowLab", vendorSlug: "glowlab", images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1400&q=85"], rating: 49, reviewCount: 341, stock: 76, sku: "GL-BARRIER-50", specifications: { "Size": "50 ml", "Skin type": "All skin types", "Key actives": "Ceramides, squalane" }, tags: ["skincare", "moisturizer", "beauty"], isFeatured: true, isDeal: false },
  { slug: "urban-nest-carryall", name: "The Carryall Tote · Moss", description: "A roomy everyday tote in sturdy recycled canvas, finished with an inside pocket for the things you reach for most.", price: 2499, originalPrice: 2999, discount: 17, category: "Fashion", subcategory: "Bags", brand: "UrbanNest", vendorSlug: "urbannest", images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 86, stock: 41, sku: "UN-TOTE-MOSS", specifications: { "Material": "Recycled canvas", "Capacity": "18 L", "Care": "Spot clean" }, tags: ["tote", "bag", "fashion"], isFeatured: true, isDeal: false },
  { slug: "homecraft-stoneware-set", name: "Stoneware Breakfast Set", description: "Four hand-finished pieces in a chalky ivory glaze designed to make even a quick breakfast feel like a ritual.", price: 3299, originalPrice: 3999, discount: 18, category: "Home & Living", subcategory: "Kitchen", brand: "HomeCraft", vendorSlug: "homecraft", images: ["https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 58, stock: 12, sku: "HC-STONE-04", specifications: { "Pieces": "4", "Material": "Stoneware", "Dishwasher safe": "Yes" }, tags: ["kitchen", "home", "ceramic"], isFeatured: true, isDeal: false },
  { slug: "fitforge-everyday-mat", name: "Everyday Training Mat", description: "A supportive, grippy surface for early starts, post-work resets, and everything between.", price: 1799, originalPrice: 2199, discount: 18, category: "Sports", subcategory: "Fitness", brand: "FitForge", vendorSlug: "fitforge", images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 66, stock: 28, sku: "FF-MAT-DAWN", specifications: { "Thickness": "6 mm", "Material": "TPE", "Length": "183 cm" }, tags: ["fitness", "yoga", "mat"], isFeatured: false, isDeal: true },
  { slug: "bookverse-the-creative-act", name: "The Creative Act", description: "A generous, clear-eyed invitation to build a creative practice you can return to.", price: 699, originalPrice: 899, discount: 22, category: "Books", subcategory: "Non-fiction", brand: "Penguin", vendorSlug: "bookverse", images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1400&q=85"], rating: 49, reviewCount: 112, stock: 58, sku: "BV-CREATIVE-ACT", specifications: { "Format": "Hardcover", "Pages": "240", "Language": "English" }, tags: ["book", "creative", "reading"], isFeatured: false, isDeal: true },
  { slug: "gadgethub-magnetic-charger", name: "Magnetic Desk Charger", description: "A compact, calm-looking charging dock for the devices you want close at hand.", price: 1899, originalPrice: 2499, discount: 24, category: "Electronics", subcategory: "Accessories", brand: "GadgetHub", vendorSlug: "gadgethub", images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85"], rating: 45, reviewCount: 74, stock: 44, sku: "GH-MAG-DOCK", specifications: { "Output": "15 W", "Ports": "USB-C", "Compatibility": "Qi2 devices" }, tags: ["charger", "desk", "tech"], isFeatured: false, isDeal: true },
  { slug: "styleaura-linen-shirt", name: "Relaxed Linen Shirt · Ink", description: "A breathable linen layer with a little extra room and a considered, easy drape.", price: 2899, originalPrice: 3499, discount: 17, category: "Fashion", subcategory: "Clothing", brand: "StyleAura", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 49, stock: 19, sku: "SA-LINEN-INK", specifications: { "Material": "100% linen", "Fit": "Relaxed", "Care": "Cold wash" }, tags: ["shirt", "linen", "fashion"], isFeatured: false, isDeal: false },
  { slug: "glowlab-scented-body-oil", name: "Sandalwood Body Oil", description: "A soft, low-glow body oil with a warm sandalwood finish for the end of the day.", price: 999, originalPrice: 1299, discount: 23, category: "Beauty", subcategory: "Body care", brand: "GlowLab", vendorSlug: "glowlab", images: ["https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 91, stock: 66, sku: "GL-OIL-SANDAL", specifications: { "Size": "100 ml", "Scent": "Sandalwood", "Finish": "Soft glow" }, tags: ["body oil", "beauty", "sandalwood"], isFeatured: false, isDeal: false },
  { slug: "urbannest-arc-lamp", name: "Arc Table Lamp · Lilac", description: "A small sculptural lamp with a warm glow and a silhouette that changes the mood of a room.", price: 4199, originalPrice: 4999, discount: 16, category: "Home & Living", subcategory: "Lighting", brand: "UrbanNest", vendorSlug: "urbannest", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 37, stock: 9, sku: "UN-ARC-LILAC", specifications: { "Bulb": "E27 LED", "Height": "42 cm", "Light": "Warm white" }, tags: ["lamp", "lighting", "home"], isFeatured: false, isDeal: false },
  { slug: "technova-soundcore-mini", name: "Soundcore Mini 3 Speaker", description: "A pocket-sized speaker with a surprisingly spacious sound for desks, balconies, and slow Sunday mornings.", price: 2499, originalPrice: 2999, discount: 17, category: "Electronics", subcategory: "Audio", brand: "Soundcore", vendorSlug: "technova", images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 88, stock: 31, sku: "TN-SOUND-MINI", specifications: { "Battery": "15 hours", "Waterproof": "IPX7", "Connectivity": "Bluetooth 5.0" }, tags: ["speaker", "audio", "wireless"], isFeatured: true, isDeal: false },
  { slug: "technova-keychron-k2", name: "Keychron K2 Mechanical Keyboard", description: "A compact mechanical keyboard with warm backlighting, tactile switches, and room for your best thinking.", price: 7499, originalPrice: 8999, discount: 17, category: "Electronics", subcategory: "Computers", brand: "Keychron", vendorSlug: "technova", images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 143, stock: 22, sku: "TN-KEY-K2", specifications: { "Layout": "75% compact", "Switches": "Gateron brown", "Backlight": "White LED" }, tags: ["keyboard", "desk", "mechanical"], isFeatured: true, isDeal: true },
  { slug: "technova-logitech-lift", name: "Lift Vertical Ergonomic Mouse", description: "An easy-on-the-wrist vertical mouse designed for long creative sessions and everyday browsing.", price: 3999, originalPrice: 4499, discount: 11, category: "Electronics", subcategory: "Accessories", brand: "Logitech", vendorSlug: "technova", images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1400&q=85"], rating: 45, reviewCount: 71, stock: 18, sku: "TN-LIFT-MOUSE", specifications: { "Connection": "Bluetooth / USB", "DPI": "400\u20134000", "Battery": "24 months" }, tags: ["mouse", "desk", "ergonomic"], isFeatured: false, isDeal: false },
  { slug: "gadgethub-instant-camera", name: "Instax Mini 12 Camera \u00b7 Lilac", description: "Point, click, and keep the little moments that deserve a place on the fridge.", price: 8999, originalPrice: 9999, discount: 10, category: "Electronics", subcategory: "Cameras", brand: "Fujifilm", vendorSlug: "gadgethub", images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 109, stock: 14, sku: "GH-INSTAX-12", specifications: { "Film": "Instax Mini", "Lens": "60 mm", "Flash": "Automatic" }, tags: ["camera", "photography", "instant"], isFeatured: true, isDeal: false },
  { slug: "gadgethub-usb-c-hub", name: "7-in-1 USB-C Hub", description: "One tidy dock for your laptop, monitor, memory cards, and the little accessories that keep work moving.", price: 2199, originalPrice: 2799, discount: 21, category: "Electronics", subcategory: "Accessories", brand: "UGREEN", vendorSlug: "gadgethub", images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?auto=format&fit=crop&w=1400&q=85"], rating: 44, reviewCount: 63, stock: 47, sku: "GH-HUB-7IN1", specifications: { "Ports": "HDMI, USB-A, USB-C", "Output": "4K HDMI", "Body": "Aluminium" }, tags: ["usb-c", "work", "accessories"], isFeatured: false, isDeal: true },
  { slug: "styleaura-leather-sling", name: "Soft Leather Sling \u00b7 Tan", description: "A small crossbody with just enough room for the day and a shape that gets better with time.", price: 4499, originalPrice: 5499, discount: 18, category: "Fashion", subcategory: "Bags", brand: "StyleAura", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 83, stock: 16, sku: "SA-SLING-TAN", specifications: { "Material": "Full-grain leather", "Strap": "Adjustable", "Capacity": "3 L" }, tags: ["bag", "leather", "crossbody"], isFeatured: true, isDeal: false },
  { slug: "styleaura-cotton-trouser", name: "Relaxed Cotton Trouser \u00b7 Stone", description: "An easy, tailored trouser cut from breathable cotton with a relaxed line through the leg.", price: 3199, originalPrice: 3999, discount: 20, category: "Fashion", subcategory: "Clothing", brand: "StyleAura", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 52, stock: 24, sku: "SA-TROUSER-STONE", specifications: { "Material": "Cotton twill", "Fit": "Relaxed tapered", "Care": "Machine wash" }, tags: ["trousers", "cotton", "fashion"], isFeatured: false, isDeal: false },
  { slug: "styleaura-silk-scarf", name: "Hand-rolled Silk Scarf \u00b7 Bloom", description: "A softly illustrated silk scarf to bring colour to a plain shirt, tote, or favourite coat.", price: 1799, originalPrice: 2299, discount: 22, category: "Fashion", subcategory: "Accessories", brand: "StyleAura", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 45, stock: 39, sku: "SA-SCARF-BLOOM", specifications: { "Material": "100% silk", "Size": "65 \u00d7 65 cm", "Finish": "Hand-rolled edge" }, tags: ["scarf", "silk", "accessory"], isFeatured: false, isDeal: true },
  { slug: "styleaura-canvas-cap", name: "Everyday Canvas Cap \u00b7 Ecru", description: "A clean six-panel cap with a soft brim and a low-key embroidered mark.", price: 899, originalPrice: 1199, discount: 25, category: "Fashion", subcategory: "Accessories", brand: "StyleAura", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1400&q=85"], rating: 45, reviewCount: 64, stock: 55, sku: "SA-CAP-ECRU", specifications: { "Material": "Cotton canvas", "Closure": "Adjustable strap", "Fit": "One size" }, tags: ["cap", "canvas", "streetwear"], isFeatured: false, isDeal: false },
  { slug: "glowlab-vitamin-c-serum", name: "Brightening Vitamin C Serum", description: "A light, fresh serum that helps skin look rested, even on the days that start too early.", price: 1599, originalPrice: 1999, discount: 20, category: "Beauty", subcategory: "Skincare", brand: "GlowLab", vendorSlug: "glowlab", images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 183, stock: 33, sku: "GL-VITC-30", specifications: { "Size": "30 ml", "Key actives": "Vitamin C, ferulic acid", "Use": "Morning" }, tags: ["serum", "vitamin c", "skincare"], isFeatured: true, isDeal: false },
  { slug: "glowlab-gentle-cleanser", name: "Cloud Milk Cleanser", description: "A creamy, low-foam cleanser that leaves the skin feeling clean, comfortable, and unhurried.", price: 899, originalPrice: 1099, discount: 18, category: "Beauty", subcategory: "Skincare", brand: "GlowLab", vendorSlug: "glowlab", images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 129, stock: 72, sku: "GL-CLEANSER-120", specifications: { "Size": "120 ml", "Texture": "Cream milk", "Skin type": "Sensitive" }, tags: ["cleanser", "beauty", "skincare"], isFeatured: false, isDeal: false },
  { slug: "glowlab-lip-tint", name: "Soft Tint Lip Oil \u00b7 Fig", description: "A sheer fig-toned tint with a cushiony finish for low-effort colour and comfort.", price: 749, originalPrice: 999, discount: 25, category: "Beauty", subcategory: "Makeup", brand: "GlowLab", vendorSlug: "glowlab", images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 77, stock: 48, sku: "GL-LIP-FIG", specifications: { "Finish": "Glossy tint", "Shade": "Fig", "Volume": "4 ml" }, tags: ["lip oil", "makeup", "tint"], isFeatured: false, isDeal: true },
  { slug: "homecraft-linen-cushion", name: "Linen Cushion Cover \u00b7 Clay", description: "A washed linen cushion cover with a quiet texture that makes a room feel instantly more lived in.", price: 799, originalPrice: 999, discount: 20, category: "Home & Living", subcategory: "Decor", brand: "HomeCraft", vendorSlug: "homecraft", images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 35, stock: 44, sku: "HC-CUSH-CLAY", specifications: { "Material": "Stonewashed linen", "Size": "45 \u00d7 45 cm", "Closure": "Hidden zip" }, tags: ["cushion", "linen", "decor"], isFeatured: true, isDeal: false },
  { slug: "homecraft-brass-tray", name: "Brass Catch-all Tray", description: "A small hand-finished tray for keys, rings, and the beautiful little things that deserve a home.", price: 1299, originalPrice: 1599, discount: 19, category: "Home & Living", subcategory: "Decor", brand: "HomeCraft", vendorSlug: "homecraft", images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 41, stock: 27, sku: "HC-TRAY-BRASS", specifications: { "Material": "Brass", "Finish": "Brushed", "Size": "20 cm" }, tags: ["tray", "brass", "home"], isFeatured: false, isDeal: false },
  { slug: "homecraft-wool-throw", name: "Wool Blend Throw \u00b7 Oat", description: "A soft, generous throw for the arm of a sofa, the end of a bed, or a cooler-than-expected evening.", price: 3899, originalPrice: 4499, discount: 13, category: "Home & Living", subcategory: "Textiles", brand: "HomeCraft", vendorSlug: "homecraft", images: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1400&q=85"], rating: 49, reviewCount: 29, stock: 11, sku: "HC-THROW-OAT", specifications: { "Material": "Wool blend", "Size": "130 \u00d7 180 cm", "Care": "Dry clean" }, tags: ["throw", "wool", "home"], isFeatured: false, isDeal: true },
  { slug: "urbannest-glass-carafe", name: "Smoke Glass Carafe", description: "A sculptural everyday carafe that makes water, iced tea, and the table around it feel more intentional.", price: 1899, originalPrice: 2299, discount: 17, category: "Home & Living", subcategory: "Kitchen", brand: "UrbanNest", vendorSlug: "urbannest", images: ["https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 63, stock: 26, sku: "UN-CARAFE-SMOKE", specifications: { "Material": "Borosilicate glass", "Capacity": "1.2 L", "Dishwasher safe": "Yes" }, tags: ["carafe", "glass", "kitchen"], isFeatured: false, isDeal: false },
  { slug: "urbannest-woven-basket", name: "Woven Storage Basket \u00b7 Large", description: "A sturdy woven basket for blankets, laundry, or the charming evidence of an ordinary life.", price: 2299, originalPrice: 2799, discount: 18, category: "Home & Living", subcategory: "Storage", brand: "UrbanNest", vendorSlug: "urbannest", images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 38, stock: 20, sku: "UN-BASKET-LG", specifications: { "Material": "Seagrass", "Size": "42 \u00d7 32 cm", "Handles": "Integrated" }, tags: ["basket", "storage", "home"], isFeatured: false, isDeal: false },
  { slug: "fitforge-resistance-bands", name: "Three-Tone Resistance Bands", description: "Three compact resistance bands for warm-ups, strength work, and movement wherever you are.", price: 699, originalPrice: 999, discount: 30, category: "Sports", subcategory: "Fitness", brand: "FitForge", vendorSlug: "fitforge", images: ["https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 94, stock: 81, sku: "FF-BANDS-3", specifications: { "Levels": "Light, medium, heavy", "Material": "Latex", "Bag": "Included" }, tags: ["fitness", "bands", "training"], isFeatured: true, isDeal: true },
  { slug: "fitforge-running-belt", name: "Reflective Running Belt", description: "A low-profile belt for keys, phone, and the small essentials that should never slow a run down.", price: 999, originalPrice: 1299, discount: 23, category: "Sports", subcategory: "Running", brand: "FitForge", vendorSlug: "fitforge", images: ["https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=1400&q=85"], rating: 45, reviewCount: 54, stock: 43, sku: "FF-RUN-BELT", specifications: { "Material": "Stretch mesh", "Pocket": "Water-resistant zip", "Visibility": "Reflective trim" }, tags: ["running", "belt", "outdoor"], isFeatured: false, isDeal: false },
  { slug: "fitforge-steel-bottle", name: "Insulated Steel Bottle \u00b7 750 ml", description: "A dependable insulated bottle that keeps the cold in and the plastic out of your everyday miles.", price: 1499, originalPrice: 1899, discount: 21, category: "Sports", subcategory: "Hydration", brand: "FitForge", vendorSlug: "fitforge", images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1550505095-81378a674395?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 68, stock: 37, sku: "FF-BOTTLE-750", specifications: { "Capacity": "750 ml", "Material": "18/8 steel", "Insulation": "24 hours cold" }, tags: ["bottle", "hydration", "fitness"], isFeatured: false, isDeal: true },
  { slug: "bookverse-meditations", name: "Meditations \u00b7 Pocket Edition", description: "A thoughtful pocket edition of Marcus Aurelius for commutes, quiet corners, and returning to what matters.", price: 399, originalPrice: 499, discount: 20, category: "Books", subcategory: "Classics", brand: "Penguin Classics", vendorSlug: "bookverse", images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=85"], rating: 49, reviewCount: 87, stock: 62, sku: "BV-MEDITATIONS", specifications: { "Format": "Paperback", "Pages": "224", "Language": "English" }, tags: ["book", "classics", "philosophy"], isFeatured: true, isDeal: false },
  { slug: "bookverse-morning-pages", name: "Morning Pages Journal \u00b7 Sand", description: "A beautiful, generous journal for the first thoughts of the day and everything that follows them.", price: 599, originalPrice: 799, discount: 25, category: "Books", subcategory: "Stationery", brand: "BookVerse", vendorSlug: "bookverse", images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 112, stock: 73, sku: "BV-JOURNAL-SAND", specifications: { "Pages": "192", "Paper": "100 gsm", "Binding": "Lay-flat" }, tags: ["journal", "stationery", "writing"], isFeatured: false, isDeal: true },
  { slug: "bookverse-fountain-pen", name: "Fountain Pen \u00b7 Midnight", description: "A balanced fountain pen with a fine nib for notes, letters, and ideas worth keeping.", price: 1199, originalPrice: 1499, discount: 20, category: "Books", subcategory: "Stationery", brand: "BookVerse", vendorSlug: "bookverse", images: ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 39, stock: 31, sku: "BV-PEN-MIDNIGHT", specifications: { "Nib": "Fine", "Ink": "Blue-black cartridge", "Body": "Aluminium" }, tags: ["pen", "stationery", "writing"], isFeatured: false, isDeal: false },
  { slug: "bookverse-way-of-art", name: "The Way of Art", description: "A visual, generous guide to noticing more, making more, and finding your own creative rhythm.", price: 1299, originalPrice: 1599, discount: 19, category: "Books", subcategory: "Art & Design", brand: "Phaidon", vendorSlug: "bookverse", images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 48, stock: 21, sku: "BV-WAY-ART", specifications: { "Format": "Hardcover", "Pages": "304", "Language": "English" }, tags: ["book", "art", "design"], isFeatured: false, isDeal: false },
];

function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(",").map(item => item.trim()).filter(Boolean);
  }
}

function parseObject(value: string | null | undefined): Record<string, string> {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return {};
  }
}

function serializeProduct(row: typeof products.$inferSelect) {
  return { ...row, images: parseList(row.images), specifications: parseObject(row.specifications), tags: parseList(row.tags) };
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = new Date();
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensureSeedData() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;
    const categoryRows = await db.select().from(categories);
    if (!categoryRows.length) await db.insert(categories).values(categorySeed);
    const vendorRowsBefore = await db.select().from(vendors);
    if (!vendorRowsBefore.length) await db.insert(vendors).values(vendorSeed);
    const categoryRowsAfter = await db.select().from(categories);
    const vendorRows = await db.select().from(vendors);
    const categoryMap = new Map(categoryRowsAfter.map(category => [category.name, category.id]));
    const vendorMap = new Map(vendorRows.map(vendor => [vendor.slug, vendor]));
    const seedRows = productSeed.map(product => {
        const vendor = vendorMap.get(product.vendorSlug);
        if (!vendor) throw new Error(`Missing seeded vendor ${product.vendorSlug}`);
        const { vendorSlug, images, specifications, tags, ...rest } = product;
        return {
          ...rest,
          categoryId: categoryMap.get(product.category),
          vendorId: vendor.id,
          vendorName: vendor.name,
          images: JSON.stringify(images),
          specifications: JSON.stringify(specifications),
          tags: JSON.stringify(tags),
        };
      });
    await db.insert(products).values(seedRows).onDuplicateKeyUpdate({ set: { images: sql`VALUES(images)`, specifications: sql`VALUES(specifications)`, tags: sql`VALUES(tags)` } });
  })().catch(error => {
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

export async function listProducts(input: { search?: string; category?: string; vendor?: string; sort?: string; featured?: boolean; deal?: boolean; limit?: number }) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (input.search) {
    const search = `%${input.search.toLowerCase()}%`;
    conditions.push(sql`(lower(${products.name}) like ${search} or lower(coalesce(${products.brand}, '')) like ${search} or lower(${products.vendorName}) like ${search} or lower(${products.category}) like ${search})`);
  }
  if (input.category) conditions.push(eq(products.category, input.category));
  if (input.vendor) conditions.push(eq(products.vendorName, input.vendor));
  if (input.featured) conditions.push(eq(products.isFeatured, true));
  if (input.deal) conditions.push(eq(products.isDeal, true));
  let query = db.select().from(products).$dynamic();
  if (conditions.length) query = query.where(and(...conditions));
  if (input.sort === "newest") query = query.orderBy(desc(products.createdAt));
  else if (input.sort === "price_low") query = query.orderBy(asc(products.price));
  else if (input.sort === "price_high") query = query.orderBy(desc(products.price));
  else if (input.sort === "rating") query = query.orderBy(desc(products.rating));
  else query = query.orderBy(desc(products.isFeatured), desc(products.createdAt));
  const rows = await query.limit(input.limit ?? 30);
  return rows.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return undefined;
  const row = (await db.select().from(products).where(eq(products.slug, slug)).limit(1))[0];
  return row ? serializeProduct(row) : undefined;
}

export async function listCategories() {
  await ensureSeedData();
  const db = await getDb();
  return db ? db.select().from(categories).orderBy(asc(categories.id)) : [];
}

export async function listVendors() {
  await ensureSeedData();
  const db = await getDb();
  return db ? db.select().from(vendors).orderBy(desc(vendors.followers)) : [];
}

export async function getVendorBySlug(slug: string) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return undefined;
  const vendor = (await db.select().from(vendors).where(eq(vendors.slug, slug)).limit(1))[0];
  if (!vendor) return undefined;
  const vendorProducts = await db.select().from(products).where(eq(products.vendorId, vendor.id)).orderBy(desc(products.isFeatured), desc(products.createdAt));
  return { ...vendor, categories: parseList(vendor.categories), products: vendorProducts.map(serializeProduct) };
}

export async function isFollowingVendor(userId: number, vendorSlug: string) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return false;
  const row = await db.select({ id: vendorFollows.id }).from(vendorFollows).innerJoin(vendors, eq(vendorFollows.vendorId, vendors.id)).where(and(eq(vendorFollows.userId, userId), eq(vendors.slug, vendorSlug))).limit(1);
  return row.length > 0;
}

export async function toggleVendorFollow(userId: number, vendorSlug: string) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const vendor = (await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.slug, vendorSlug)).limit(1))[0];
  if (!vendor) throw new Error("Vendor not found");
  const existing = await db.select({ id: vendorFollows.id }).from(vendorFollows).where(and(eq(vendorFollows.userId, userId), eq(vendorFollows.vendorId, vendor.id))).limit(1);
  if (existing.length) {
    await db.delete(vendorFollows).where(eq(vendorFollows.id, existing[0].id));
    await db.update(vendors).set({ followers: sql`greatest(${vendors.followers} - 1, 0)` }).where(eq(vendors.id, vendor.id));
  } else {
    await db.insert(vendorFollows).values({ userId, vendorId: vendor.id });
    await db.update(vendors).set({ followers: sql`${vendors.followers} + 1` }).where(eq(vendors.id, vendor.id));
  }
  return isFollowingVendor(userId, vendorSlug);
}

export async function getCart(userId: number) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return { items: [], subtotal: 0, discount: 0, delivery: 0, tax: 0, total: 0 };
  const rows = await db.select({ id: cartItems.id, productId: products.id, slug: products.slug, name: products.name, price: products.price, originalPrice: products.originalPrice, image: products.images, vendorId: products.vendorId, vendorName: products.vendorName, quantity: cartItems.quantity, stock: products.stock }).from(cartItems).innerJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.createdAt));
  const items = rows.map(row => ({ ...row, image: parseList(row.image)[0] ?? "" }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const original = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const discount = Math.max(0, original - subtotal);
  const delivery = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  return { items, subtotal, discount, delivery, tax, total: subtotal + delivery + tax };
}

export async function addCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(cartItems).values({ userId, productId, quantity }).onDuplicateKeyUpdate({ set: { quantity: sql`${cartItems.quantity} + ${quantity}`, updatedAt: new Date() } });
  return getCart(userId);
}

export async function updateCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (quantity <= 0) await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  else await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  return getCart(userId);
}

export async function removeCartItem(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  return getCart(userId);
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
  return getCart(userId);
}

export async function getWishlist(userId: number) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ wishlistId: wishlists.id, product: products }).from(wishlists).innerJoin(products, eq(wishlists.productId, products.id)).where(eq(wishlists.userId, userId)).orderBy(desc(wishlists.createdAt));
  return rows.map(row => ({ wishlistId: row.wishlistId, product: serializeProduct(row.product) }));
}

export async function toggleWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select({ id: wishlists.id }).from(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))).limit(1);
  if (existing.length) await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
  else await db.insert(wishlists).values({ userId, productId });
  return getWishlist(userId);
}

export async function listReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

type OrderStatus = typeof orders.$inferSelect["status"];
type EventActor = "system" | "customer" | "vendor" | "admin";

const trackingCopy: Record<OrderStatus, { title: string; description: string }> = {
  placed: { title: "Order placed", description: "We received your order and are getting it ready." },
  confirmed: { title: "Order confirmed", description: "The seller confirmed your order." },
  packed: { title: "Order packed", description: "Your parcel is packed and ready to leave the seller." },
  shipped: { title: "Order shipped", description: "Your order is on the way." },
  out_for_delivery: { title: "Out for delivery", description: "Your order is arriving today." },
  delivered: { title: "Order delivered", description: "Your order has arrived. Enjoy your new find." },
  cancelled: { title: "Order cancelled", description: "This order was cancelled and will not be delivered." },
};

async function recordOrderEvent(orderId: number, status: OrderStatus, actorRole: EventActor, description?: string) {
  const db = await getDb();
  if (!db) return;
  const copy = trackingCopy[status];
  await db.insert(orderEvents).values({ orderId, status, title: copy.title, description: description ?? copy.description, actorRole });
}

async function notifyCustomer(userId: number, orderId: number, type: "order" | "shipment" | "review", title: string, body: string, actionUrl: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({ userId, orderId, channel: "in_app", status: "unread", type, title, body, actionUrl });

  const providerUrl = process.env.TRANSACTIONAL_EMAIL_WEBHOOK_URL;
  if (!providerUrl) return;
  const email = (await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1))[0]?.email;
  if (!email) return;
  const result = await db.insert(notifications).values({ userId, orderId, channel: "email", status: "queued", type, title, body, actionUrl });
  const emailNotificationId = Number(result[0].insertId);
  try {
    const response = await fetch(providerUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: email, subject: title, text: body, orderId, actionUrl }), signal: AbortSignal.timeout(3500) });
    await db.update(notifications).set({ status: response.ok ? "sent" : "failed" }).where(eq(notifications.id, emailNotificationId));
  } catch {
    await db.update(notifications).set({ status: "failed" }).where(eq(notifications.id, emailNotificationId));
  }
}

async function fallbackTrackingEvents(order: typeof orders.$inferSelect) {
  const currentIndex = order.status === "cancelled" ? orderStatusKeys.length : orderStatusKeys.indexOf(order.status);
  const statuses = order.status === "cancelled" ? [...orderStatusKeys, "cancelled" as const] : orderStatusKeys.slice(0, currentIndex + 1);
  return statuses.map(status => ({
    id: 0,
    orderId: order.id,
    status,
    title: trackingCopy[status].title,
    description: trackingCopy[status].description,
    actorRole: "system" as const,
    createdAt: order.createdAt,
  }));
}

const orderStatusKeys: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export async function getOrderEvents(userId: number, orderNumber: string) {
  const db = await getDb();
  if (!db) return [];
  const order = (await db.select().from(orders).where(and(eq(orders.userId, userId), eq(orders.orderNumber, orderNumber))).limit(1))[0];
  if (!order) return [];
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt), asc(orderEvents.id));
  return events.length ? events : fallbackTrackingEvents(order);
}

export async function listNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.channel, "in_app"))).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function unreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.channel, "in_app"), eq(notifications.status, "unread")));
  return Number(rows[0]?.count ?? 0);
}

export async function markNotificationRead(userId: number, notificationId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = notificationId ? and(eq(notifications.userId, userId), eq(notifications.id, notificationId), eq(notifications.channel, "in_app")) : and(eq(notifications.userId, userId), eq(notifications.channel, "in_app"), eq(notifications.status, "unread"));
  await db.update(notifications).set({ status: "read", readAt: new Date() }).where(where);
  return listNotifications(userId);
}

export async function listVendorShipments(userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) return [];
  const actor = (await db.select({ role: users.role, vendorId: users.vendorId }).from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!isAdmin && !actor?.vendorId) return [];
  const rows = isAdmin
    ? await db.select({ order: orders, item: orderItems }).from(orders).innerJoin(orderItems, eq(orderItems.orderId, orders.id)).orderBy(desc(orders.createdAt))
    : await db.select({ order: orders, item: orderItems }).from(orders).innerJoin(orderItems, eq(orderItems.orderId, orders.id)).where(eq(orderItems.vendorId, actor?.vendorId ?? 0)).orderBy(desc(orders.createdAt));
  const byOrder = new Map<number, { order: typeof orders.$inferSelect; items: Array<typeof orderItems.$inferSelect> }>();
  for (const row of rows) {
    const current = byOrder.get(row.order.id) ?? { order: row.order, items: [] };
    current.items.push(row.item);
    byOrder.set(row.order.id, current);
  }
  return Array.from(byOrder.values()).map(entry => ({ ...entry.order, address: parseObject(entry.order.address), items: entry.items }));
}

export async function updateShipmentStatus(input: { userId: number; role: "vendor" | "admin"; orderNumber: string; status: Exclude<OrderStatus, "placed" | "cancelled">; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const order = (await db.select().from(orders).where(eq(orders.orderNumber, input.orderNumber)).limit(1))[0];
  if (!order) throw new Error("Order not found");
  if (order.status === "cancelled" || order.status === "delivered") throw new Error("This order can no longer be updated.");
  if (input.role === "vendor") {
    const actor = (await db.select({ vendorId: users.vendorId }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
    const ownership = actor?.vendorId ? await db.select({ id: orderItems.id }).from(orderItems).where(and(eq(orderItems.orderId, order.id), eq(orderItems.vendorId, actor.vendorId))).limit(1) : [];
    if (!ownership.length) throw new Error("This shipment is not assigned to your store.");
  }
  const currentIndex = orderStatusKeys.indexOf(order.status);
  const nextIndex = orderStatusKeys.indexOf(input.status);
  if (nextIndex <= currentIndex) throw new Error("Shipment status can only move forward.");
  const result = await db.update(orders).set({ status: input.status }).where(and(eq(orders.id, order.id), eq(orders.status, order.status)));
  if (Number(result[0]?.affectedRows ?? 0) === 0) throw new Error("Shipment changed before this update could be saved.");
  await recordOrderEvent(order.id, input.status, input.role, input.note?.trim() || undefined);
  const copy = trackingCopy[input.status];
  await notifyCustomer(order.userId, order.id, input.status === "delivered" ? "review" : "shipment", copy.title, input.note?.trim() || copy.description, `/order/${order.orderNumber}`).catch(() => undefined);
  return getOrderByNumber(order.userId, order.orderNumber);
}

async function enrichOrders(userId: number, orderRows: (typeof orders.$inferSelect)[]) {
  const db = await getDb();
  if (!db || !orderRows.length) return [];
  const orderIds = orderRows.map(order => order.id);
  const itemRows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  const productIds = Array.from(new Set(itemRows.map(item => item.productId)));
  const reviewRows = productIds.length
    ? await db.select({ productId: reviews.productId }).from(reviews).where(and(eq(reviews.userId, userId), inArray(reviews.productId, productIds)))
    : [];
  const reviewedIds = new Set(reviewRows.map(review => review.productId));
  return orderRows.map(order => ({
    ...order,
    address: parseObject(order.address),
    items: itemRows.filter(item => item.orderId === order.id).map(item => ({ ...item, reviewed: reviewedIds.has(item.productId) })),
  }));
}

export async function getOrderByNumber(userId: number, orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(orders).where(and(eq(orders.userId, userId), eq(orders.orderNumber, orderNumber))).limit(1);
  return (await enrichOrders(userId, rows))[0];
}

export async function cancelOrder(userId: number, orderNumber: string, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select({ id: orders.id, status: orders.status }).from(orders).where(and(eq(orders.userId, userId), eq(orders.orderNumber, orderNumber))).limit(1);
  if (!existing.length) throw new Error("Order not found");
  if (existing[0].status !== "placed" && existing[0].status !== "confirmed") throw new Error("This order can no longer be cancelled because fulfilment has started.");
  const result = await db.update(orders).set({ status: "cancelled", cancelReason: reason?.trim() || "Cancelled by customer", cancelledAt: new Date() }).where(and(eq(orders.id, existing[0].id), inArray(orders.status, ["placed", "confirmed"])));
  if (Number(result[0]?.affectedRows ?? 0) === 0) throw new Error("This order can no longer be cancelled because fulfilment has started.");
  await recordOrderEvent(existing[0].id, "cancelled", "customer", reason?.trim() || undefined);
  await notifyCustomer(userId, existing[0].id, "order", "Order cancelled", "Your order was cancelled successfully.", `/order/${orderNumber}`).catch(() => undefined);
  return getOrderByNumber(userId, orderNumber);
}

export async function reorder(userId: number, orderNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const order = await getOrderByNumber(userId, orderNumber);
  if (!order) throw new Error("Order not found");
  const productIds = order.items.map(item => item.productId);
  const productRows = productIds.length ? await db.select().from(products).where(inArray(products.id, productIds)) : [];
  const productMap = new Map(productRows.map(product => [product.id, product]));
  const addedItems: Array<{ productId: number; productName: string; quantity: number }> = [];
  const unavailableItems: Array<{ productId: number; productName: string; reason: string }> = [];
  for (const item of order.items) {
    const product = productMap.get(item.productId);
    if (!product || product.stock <= 0) {
      unavailableItems.push({ productId: item.productId, productName: item.productName, reason: "Currently out of stock" });
      continue;
    }
    const quantity = Math.min(item.quantity, product.stock);
    await db.insert(cartItems).values({ userId, productId: product.id, quantity }).onDuplicateKeyUpdate({ set: { quantity: sql`least(${cartItems.quantity} + ${quantity}, ${product.stock})`, updatedAt: new Date() } });
    addedItems.push({ productId: product.id, productName: product.name, quantity });
    if (quantity < item.quantity) unavailableItems.push({ productId: product.id, productName: product.name, reason: `Only ${product.stock} available` });
  }
  return { orderNumber, addedItems, unavailableItems, cart: await getCart(userId) };
}

export async function getReviewStatus(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return { eligible: false, reviewed: false };
  const purchase = await db.select({ id: orderItems.id }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(and(eq(orders.userId, userId), eq(orderItems.productId, productId))).limit(1);
  const existing = await db.select({ id: reviews.id }).from(reviews).where(and(eq(reviews.userId, userId), eq(reviews.productId, productId))).limit(1);
  return { eligible: purchase.length > 0, reviewed: existing.length > 0 };
}

export async function createReview(input: { userId: number; productId: number; userName: string; rating: number; title: string; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const status = await getReviewStatus(input.userId, input.productId);
  if (!status.eligible) throw new Error("You can review products only after purchasing them.");
  if (status.reviewed) throw new Error("You have already reviewed this product.");
  const product = (await db.select({ rating: products.rating, reviewCount: products.reviewCount }).from(products).where(eq(products.id, input.productId)).limit(1))[0];
  if (!product) throw new Error("Product not found");
  await db.insert(reviews).values({ ...input, verifiedPurchase: true });
  const nextCount = product.reviewCount + 1;
  const nextRating = Math.round(((product.rating * product.reviewCount) + (input.rating * 10)) / nextCount);
  await db.update(products).set({ rating: nextRating, reviewCount: nextCount }).where(eq(products.id, input.productId));
  return listReviews(input.productId);
}

export async function createOrder(input: { userId: number; items: Array<{ productId: number; quantity: number }>; address: Record<string, string>; paymentMethod: "upi" | "credit_card" | "debit_card" | "cod" }) {
  await ensureSeedData();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const ids = input.items.map(item => item.productId);
  const productRows = await db.select().from(products).where(inArray(products.id, ids));
  const productMap = new Map(productRows.map(product => [product.id, product]));
  const normalizedItems = input.items.map(item => ({ product: productMap.get(item.productId), quantity: Math.max(1, item.quantity) })).filter(item => item.product);
  if (!normalizedItems.length) throw new Error("Your cart is empty");
  const subtotal = normalizedItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const original = normalizedItems.reduce((sum, item) => sum + (item.product?.originalPrice ?? 0) * item.quantity, 0);
  const discount = Math.max(0, original - subtotal);
  const delivery = subtotal >= 1999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;
  const orderNumber = `GZ-${Date.now().toString(36).toUpperCase()}`;
  const expectedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const paymentStatus = input.paymentMethod === "cod" ? "pending" : "completed";
  const paymentReference = `${input.paymentMethod === "cod" ? "COD" : "GZPAY"}-${Date.now().toString(36).toUpperCase()}`;
  const result = await db.insert(orders).values({ userId: input.userId, orderNumber, subtotal, discount, delivery, tax, total, address: JSON.stringify(input.address), paymentMethod: input.paymentMethod, paymentStatus, paymentReference, expectedDelivery });
  const orderId = Number(result[0].insertId);
  await db.insert(orderItems).values(normalizedItems.map(item => ({ orderId, productId: item.product?.id ?? 0, productName: item.product?.name ?? "", vendorId: item.product?.vendorId ?? 0, vendorName: item.product?.vendorName ?? "", price: item.product?.price ?? 0, quantity: item.quantity, image: parseList(item.product?.images)[0] ?? "" })));
  await db.delete(cartItems).where(eq(cartItems.userId, input.userId));
  await recordOrderEvent(orderId, "placed", "system");
  await notifyCustomer(input.userId, orderId, "order", "Order confirmed", `Your order ${orderNumber} was placed successfully.`, `/order/${orderNumber}`).catch(() => undefined);
  return { orderId, orderNumber, subtotal, discount, delivery, tax, total, address: input.address, paymentMethod: input.paymentMethod, paymentStatus, paymentReference, items: normalizedItems.map(item => ({ productId: item.product?.id ?? 0, productName: item.product?.name ?? "", quantity: item.quantity, price: item.product?.price ?? 0, image: parseList(item.product?.images)[0] ?? "" })), expectedDelivery, status: "placed" };
}

export async function listOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const orderRows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  return enrichOrders(userId, orderRows);
}

export async function getVendorStats() {
  const db = await getDb();
  if (!db) return { totalSales: 0, orders: 0, products: 0, customers: 0, revenue: 0 };
  const [productCount, orderCount, sales] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` }).from(orders),
  ]);
  return { totalSales: Number(sales[0]?.total ?? 0), orders: Number(orderCount[0]?.count ?? 0), products: Number(productCount[0]?.count ?? 0), customers: Number(orderCount[0]?.count ?? 0), revenue: Number(sales[0]?.total ?? 0) };
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { users: 0, vendors: 0, products: 0, orders: 0, revenue: 0 };
  const [userCount, vendorCount, productCount, orderCount, sales] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(vendors),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` }).from(orders),
  ]);
  return { users: Number(userCount[0]?.count ?? 0), vendors: Number(vendorCount[0]?.count ?? 0), products: Number(productCount[0]?.count ?? 0), orders: Number(orderCount[0]?.count ?? 0), revenue: Number(sales[0]?.total ?? 0) };
}
