import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cartItems,
  categories,
  InsertUser,
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
  { slug: "fitforge-everyday-mat", name: "Everyday Training Mat", description: "A supportive, grippy surface for early starts, post-work resets, and everything between.", price: 1799, originalPrice: 2199, discount: 18, category: "Sports", subcategory: "Fitness", brand: "FitForge", vendorSlug: "fitforge", images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1599447292180-45fd84092ef4?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 66, stock: 28, sku: "FF-MAT-DAWN", specifications: { "Thickness": "6 mm", "Material": "TPE", "Length": "183 cm" }, tags: ["fitness", "yoga", "mat"], isFeatured: false, isDeal: true },
  { slug: "bookverse-the-creative-act", name: "The Creative Act", description: "A generous, clear-eyed invitation to build a creative practice you can return to.", price: 699, originalPrice: 899, discount: 22, category: "Books", subcategory: "Non-fiction", brand: "Penguin", vendorSlug: "bookverse", images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1400&q=85"], rating: 49, reviewCount: 112, stock: 58, sku: "BV-CREATIVE-ACT", specifications: { "Format": "Hardcover", "Pages": "240", "Language": "English" }, tags: ["book", "creative", "reading"], isFeatured: false, isDeal: true },
  { slug: "gadgethub-magnetic-charger", name: "Magnetic Desk Charger", description: "A compact, calm-looking charging dock for the devices you want close at hand.", price: 1899, originalPrice: 2499, discount: 24, category: "Electronics", subcategory: "Accessories", brand: "GadgetHub", vendorSlug: "gadgethub", images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1609592424384-795b6a8d8f94?auto=format&fit=crop&w=1400&q=85"], rating: 45, reviewCount: 74, stock: 44, sku: "GH-MAG-DOCK", specifications: { "Output": "15 W", "Ports": "USB-C", "Compatibility": "Qi2 devices" }, tags: ["charger", "desk", "tech"], isFeatured: false, isDeal: true },
  { slug: "styleaura-linen-shirt", name: "Relaxed Linen Shirt · Ink", description: "A breathable linen layer with a little extra room and a considered, easy drape.", price: 2899, originalPrice: 3499, discount: 17, category: "Fashion", subcategory: "Clothing", brand: "StyleAura", vendorSlug: "styleaura", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1626497766785-5e4a8f4b0d35?auto=format&fit=crop&w=1400&q=85"], rating: 46, reviewCount: 49, stock: 19, sku: "SA-LINEN-INK", specifications: { "Material": "100% linen", "Fit": "Relaxed", "Care": "Cold wash" }, tags: ["shirt", "linen", "fashion"], isFeatured: false, isDeal: false },
  { slug: "glowlab-scented-body-oil", name: "Sandalwood Body Oil", description: "A soft, low-glow body oil with a warm sandalwood finish for the end of the day.", price: 999, originalPrice: 1299, discount: 23, category: "Beauty", subcategory: "Body care", brand: "GlowLab", vendorSlug: "glowlab", images: ["https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=85"], rating: 48, reviewCount: 91, stock: 66, sku: "GL-OIL-SANDAL", specifications: { "Size": "100 ml", "Scent": "Sandalwood", "Finish": "Soft glow" }, tags: ["body oil", "beauty", "sandalwood"], isFeatured: false, isDeal: false },
  { slug: "urbannest-arc-lamp", name: "Arc Table Lamp · Lilac", description: "A small sculptural lamp with a warm glow and a silhouette that changes the mood of a room.", price: 4199, originalPrice: 4999, discount: 16, category: "Home & Living", subcategory: "Lighting", brand: "UrbanNest", vendorSlug: "urbannest", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85"], rating: 47, reviewCount: 37, stock: 9, sku: "UN-ARC-LILAC", specifications: { "Bulb": "E27 LED", "Height": "42 cm", "Light": "Warm white" }, tags: ["lamp", "lighting", "home"], isFeatured: false, isDeal: false },
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
    const existing = await db.select({ id: categories.id }).from(categories).limit(1);
    if (existing.length) return;
    await db.insert(categories).values(categorySeed);
    await db.insert(vendors).values(vendorSeed);
    const categoryRows = await db.select().from(categories);
    const vendorRows = await db.select().from(vendors);
    const categoryMap = new Map(categoryRows.map(category => [category.name, category.id]));
    const vendorMap = new Map(vendorRows.map(vendor => [vendor.slug, vendor]));
    await db.insert(products).values(productSeed.map(product => {
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
    }));
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
  if (input.sort === "price_low") query = query.orderBy(asc(products.price));
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

export async function createReview(input: { userId: number; productId: number; userName: string; rating: number; title: string; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(reviews).values({ ...input, verifiedPurchase: true });
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
  const result = await db.insert(orders).values({ userId: input.userId, orderNumber, subtotal, discount, delivery, tax, total, address: JSON.stringify(input.address), paymentMethod: input.paymentMethod, expectedDelivery });
  const orderId = Number(result[0].insertId);
  await db.insert(orderItems).values(normalizedItems.map(item => ({ orderId, productId: item.product?.id ?? 0, productName: item.product?.name ?? "", vendorId: item.product?.vendorId ?? 0, vendorName: item.product?.vendorName ?? "", price: item.product?.price ?? 0, quantity: item.quantity, image: parseList(item.product?.images)[0] ?? "" })));
  await db.delete(cartItems).where(eq(cartItems.userId, input.userId));
  return { orderId, orderNumber, total, expectedDelivery, status: "placed" };
}

export async function listOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const orderRows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  const ids = orderRows.map(order => order.id);
  const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
  return orderRows.map(order => ({ ...order, address: parseObject(order.address), items: items.filter(item => item.orderId === order.id) }));
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
