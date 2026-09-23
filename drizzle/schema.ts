import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "vendor", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  eyebrow: varchar("eyebrow", { length: 80 }),
  image: text("image").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  logo: text("logo"),
  coverImage: text("coverImage"),
  description: text("description"),
  rating: int("rating").default(47).notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  productCount: int("productCount").default(0).notNull(),
  categories: text("categories"),
  location: varchar("location", { length: 120 }),
  verified: boolean("verified").default(true).notNull(),
  followers: int("followers").default(0).notNull(),
  contact: varchar("contact", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    name: varchar("name", { length: 220 }).notNull(),
    description: text("description").notNull(),
    price: int("price").notNull(),
    originalPrice: int("originalPrice").notNull(),
    discount: int("discount").notNull(),
    categoryId: int("categoryId"),
    category: varchar("category", { length: 100 }).notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    brand: varchar("brand", { length: 120 }),
    vendorId: int("vendorId").notNull(),
    vendorName: varchar("vendorName", { length: 160 }).notNull(),
    images: text("images").notNull(),
    rating: int("rating").default(45).notNull(),
    reviewCount: int("reviewCount").default(0).notNull(),
    stock: int("stock").default(0).notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    specifications: text("specifications"),
    tags: text("tags"),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    isDeal: boolean("isDeal").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    categoryIdx: index("products_category_idx").on(table.category),
    vendorIdx: index("products_vendor_idx").on(table.vendorId),
  }),
);

export const cartItems = mysqlTable(
  "cartItems",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userProductUnique: uniqueIndex("cart_user_product_unique").on(table.userId, table.productId),
    userIdx: index("cart_user_idx").on(table.userId),
  }),
);

export const wishlists = mysqlTable(
  "wishlists",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userProductUnique: uniqueIndex("wishlist_user_product_unique").on(table.userId, table.productId),
  }),
);

export const vendorFollows = mysqlTable(
  "vendorFollows",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    vendorId: int("vendorId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userVendorUnique: uniqueIndex("vendor_follow_user_vendor_unique").on(table.userId, table.vendorId),
  }),
);

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
    status: mysqlEnum("status", ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]).default("placed").notNull(),
    subtotal: int("subtotal").notNull(),
    discount: int("discount").default(0).notNull(),
    delivery: int("delivery").default(0).notNull(),
    tax: int("tax").default(0).notNull(),
    total: int("total").notNull(),
    address: text("address").notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["upi", "credit_card", "debit_card", "cod"]).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", ["completed", "pending", "failed"]).default("pending").notNull(),
    paymentReference: varchar("paymentReference", { length: 80 }),
    cancelReason: text("cancelReason"),
    cancelledAt: timestamp("cancelledAt"),
    expectedDelivery: timestamp("expectedDelivery"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ userIdx: index("orders_user_idx").on(table.userId) }),
);

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 220 }).notNull(),
  vendorId: int("vendorId").notNull(),
  vendorName: varchar("vendorName", { length: 160 }).notNull(),
  price: int("price").notNull(),
  quantity: int("quantity").notNull(),
  image: text("image"),
});

export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    userName: varchar("userName", { length: 160 }).notNull(),
    rating: int("rating").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body").notNull(),
    verifiedPurchase: boolean("verifiedPurchase").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    productIdx: index("reviews_product_idx").on(table.productId),
    userProductUnique: uniqueIndex("reviews_user_product_unique").on(table.userId, table.productId),
  }),
);

export type Category = typeof categories.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type WishlistItem = typeof wishlists.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type VendorFollow = typeof vendorFollows.$inferSelect;
