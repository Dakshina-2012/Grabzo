import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(id: number, role: "user" | "vendor" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id,
      openId: `order-actions-${id}`,
      name: "Action Tester",
      email: `actions-${id}@example.com`,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const address = {
  name: "Action Tester",
  phone: "9999999999",
  house: "10",
  street: "Grabzo Lane",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
};

async function firstProduct() {
  const caller = appRouter.createCaller(createAuthContext(998001));
  const [product] = await caller.catalog.products({ limit: 1 });
  return product;
}

describe("order actions and verified reviews", () => {
  it("returns an owned order detail and cancels only before fulfillment", async () => {
    const caller = appRouter.createCaller(createAuthContext(998101));
    const product = await firstProduct();
    const created = await caller.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "cod" });
    const detail = await caller.orders.get({ orderNumber: created.orderNumber });

    expect(detail?.orderNumber).toBe(created.orderNumber);
    expect(detail?.items[0]?.productId).toBe(product.id);
    expect(detail?.items[0]?.reviewed).toBe(false);

    const cancelled = await caller.orders.cancel({ orderNumber: created.orderNumber, reason: "Ordered by mistake" });
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.cancelReason).toBe("Ordered by mistake");
    await expect(caller.orders.cancel({ orderNumber: created.orderNumber })).rejects.toThrow("can no longer be cancelled");
  }, 15000);

  it("reorders available items into the authenticated customer bag", async () => {
    const caller = appRouter.createCaller(createAuthContext(998102));
    const product = await firstProduct();
    const created = await caller.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "upi" });
    const result = await caller.orders.reorder({ orderNumber: created.orderNumber });

    expect(result.addedItems).toHaveLength(1);
    expect(result.addedItems[0]?.productId).toBe(product.id);
    expect(result.unavailableItems).toHaveLength(0);
    await caller.cart.clear();
  });

  it("allows one verified review after purchase and updates the product aggregate", async () => {
    const caller = appRouter.createCaller(createAuthContext(Math.floor(Date.now() / 1000)));
    const product = await firstProduct();
    const before = await caller.catalog.bySlug({ slug: product.slug });
    await caller.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "upi" });
    const status = await caller.reviews.status({ productId: product.id });
    expect(status).toEqual({ eligible: true, reviewed: false });

    await caller.reviews.create({ productId: product.id, rating: 5, title: "A useful everyday pick", body: "Arrived quickly and feels thoughtfully made." });
    const after = await caller.catalog.bySlug({ slug: product.slug });
    expect(after?.reviewCount).toBe((before?.reviewCount ?? 0) + 1);
    expect((await caller.reviews.status({ productId: product.id })).reviewed).toBe(true);
    await expect(caller.reviews.create({ productId: product.id, rating: 4, title: "Another review", body: "This duplicate should not be accepted." })).rejects.toThrow("already reviewed");
  }, 15000);

  it("blocks vendor dashboard data for a customer role", async () => {
    const customer = appRouter.createCaller(createAuthContext(998104, "user"));
    await expect(customer.dashboard.vendorStats()).rejects.toThrow("Vendor access is required");
    await expect(customer.dashboard.adminOverview()).rejects.toThrow();
  });
});
