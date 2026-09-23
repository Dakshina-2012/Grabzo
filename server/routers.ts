import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addCartItem,
  cancelOrder,
  clearCart,
  createOrder,
  createReview,
  getAdminOverview,
  getCart,
  getOrderByNumber,
  getProductBySlug,
  getReviewStatus,
  getVendorBySlug,
  getVendorStats,
  getWishlist,
  isFollowingVendor,
  listCategories,
  listOrders,
  listProducts,
  listReviews,
  listVendors,
  removeCartItem,
  reorder,
  toggleWishlist,
  toggleVendorFollow,
  updateCartItem,
} from "./db";

const vendorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "vendor" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Vendor access is required for this workspace." });
  return next();
});

const productListInput = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  sort: z.enum(["relevance", "newest", "price_low", "price_high", "rating"]).optional(),
  featured: z.boolean().optional(),
  deal: z.boolean().optional(),
  limit: z.number().int().min(1).max(60).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    products: publicProcedure.input(productListInput.optional()).query(({ input }) => listProducts(input ?? {})),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => getProductBySlug(input.slug)),
    categories: publicProcedure.query(() => listCategories()),
    vendors: publicProcedure.query(() => listVendors()),
    vendorBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => getVendorBySlug(input.slug)),
    vendorFollowing: protectedProcedure.input(z.object({ slug: z.string() })).query(({ ctx, input }) => isFollowingVendor(ctx.user.id, input.slug)),
    toggleVendorFollowing: protectedProcedure.input(z.object({ slug: z.string() })).mutation(({ ctx, input }) => toggleVendorFollow(ctx.user.id, input.slug)),
  }),
  cart: router({
    get: protectedProcedure.query(({ ctx }) => getCart(ctx.user.id)),
    add: protectedProcedure.input(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(20).default(1) })).mutation(({ ctx, input }) => addCartItem(ctx.user.id, input.productId, input.quantity)),
    update: protectedProcedure.input(z.object({ productId: z.number().int(), quantity: z.number().int().min(0).max(20) })).mutation(({ ctx, input }) => updateCartItem(ctx.user.id, input.productId, input.quantity)),
    remove: protectedProcedure.input(z.object({ productId: z.number().int() })).mutation(({ ctx, input }) => removeCartItem(ctx.user.id, input.productId)),
    clear: protectedProcedure.mutation(({ ctx }) => clearCart(ctx.user.id)),
  }),
  wishlist: router({
    list: protectedProcedure.query(({ ctx }) => getWishlist(ctx.user.id)),
    toggle: protectedProcedure.input(z.object({ productId: z.number().int() })).mutation(({ ctx, input }) => toggleWishlist(ctx.user.id, input.productId)),
  }),
  reviews: router({
    list: publicProcedure.input(z.object({ productId: z.number().int() })).query(({ input }) => listReviews(input.productId)),
    status: protectedProcedure.input(z.object({ productId: z.number().int() })).query(({ ctx, input }) => getReviewStatus(ctx.user.id, input.productId)),
    create: protectedProcedure.input(z.object({ productId: z.number().int(), rating: z.number().int().min(1).max(5), title: z.string().trim().min(2).max(180), body: z.string().trim().min(10).max(2000) })).mutation(({ ctx, input }) => createReview({ ...input, userId: ctx.user.id, userName: ctx.user.name ?? "Grabzo shopper" })),
  }),
  orders: router({
    list: protectedProcedure.query(({ ctx }) => listOrders(ctx.user.id)),
    get: protectedProcedure.input(z.object({ orderNumber: z.string().min(4).max(40) })).query(({ ctx, input }) => getOrderByNumber(ctx.user.id, input.orderNumber)),
    cancel: protectedProcedure.input(z.object({ orderNumber: z.string().min(4).max(40), reason: z.string().trim().max(500).optional() })).mutation(({ ctx, input }) => cancelOrder(ctx.user.id, input.orderNumber, input.reason)),
    reorder: protectedProcedure.input(z.object({ orderNumber: z.string().min(4).max(40) })).mutation(({ ctx, input }) => reorder(ctx.user.id, input.orderNumber)),
    create: protectedProcedure.input(z.object({ items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(20) })).min(1), address: z.record(z.string(), z.string()), paymentMethod: z.enum(["upi", "credit_card", "debit_card", "cod"]) })).mutation(({ ctx, input }) => createOrder({ ...input, userId: ctx.user.id })),
  }),
  dashboard: router({
    vendorStats: vendorProcedure.query(() => getVendorStats()),
    adminOverview: adminProcedure.query(() => getAdminOverview()),
  }),
});

export type AppRouter = typeof appRouter;
