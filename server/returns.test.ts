import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(id: number, role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: { id, openId: `returns-${id}`, name: "Returns Tester", email: `returns-${id}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const address = { name: "Returns Tester", phone: "9999999999", house: "10", street: "Grabzo Lane", city: "Bengaluru", state: "Karnataka", pincode: "560001" };

async function firstProduct() {
  const caller = appRouter.createCaller(context(998801));
  return (await caller.catalog.products({ limit: 1 }))[0];
}

describe("shipment tracking and returns", () => {
  it("persists seller tracking details and completes a return/refund lifecycle", async () => {
    const customerId = 999000 + Math.floor(Math.random() * 700);
    const customer = appRouter.createCaller(context(customerId));
    const admin = appRouter.createCaller(context(customerId + 1, "admin"));
    const product = await firstProduct();
    const created = await customer.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "upi" });
    const statuses = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const;
    for (const status of statuses) {
      await admin.dashboard.updateShipment({ orderNumber: created.orderNumber, status, trackingCarrier: "ParcelSwift", trackingNumber: "PS-123456", trackingUrl: "https://parcelswift.example/track/PS-123456" });
    }

    const delivered = await customer.orders.get({ orderNumber: created.orderNumber });
    expect(delivered?.status).toBe("delivered");
    expect(delivered?.trackingCarrier).toBe("ParcelSwift");
    expect(delivered?.trackingNumber).toBe("PS-123456");
    expect(delivered?.trackingUrl).toBe("https://parcelswift.example/track/PS-123456");

    const requested = await customer.orders.requestReturn({ orderNumber: created.orderNumber, reason: "Damaged or defective", customerNote: "The outer box arrived damaged.", refundAmount: created.total, items: [{ productId: product.id, quantity: 1 }] });
    expect(requested.status).toBe("requested");

    const sellerQueue = await admin.dashboard.returns();
    expect(sellerQueue.some((item: any) => item.id === requested.id)).toBe(true);
    expect((await admin.dashboard.reviewReturn({ returnId: requested.id, status: "approved", sellerNote: "Approved. Please send the item back." })).status).toBe("approved");
    expect((await admin.dashboard.reviewReturn({ returnId: requested.id, status: "received" })).status).toBe("received");
    const refunded = await admin.dashboard.reviewReturn({ returnId: requested.id, status: "refunded", sellerNote: "Refund issued to the original payment method." });
    expect(refunded.status).toBe("refunded");
    expect(refunded.refundReference).toMatch(/^RF-/);

    const history = await customer.orders.returns({ orderNumber: created.orderNumber });
    expect(history[0]?.status).toBe("refunded");
    const events = await customer.orders.events({ orderNumber: created.orderNumber });
    expect(events.some((event: any) => event.description.includes("Return requested"))).toBe(true);
    const notifications = await customer.notifications.list();
    expect(notifications.some((notification: any) => notification.title === "Return refunded")).toBe(true);
  }, 30000);

  it("rejects insecure tracking URLs and duplicate active return requests", async () => {
    const customerId = 999800 + Math.floor(Math.random() * 100);
    const customer = appRouter.createCaller(context(customerId));
    const admin = appRouter.createCaller(context(customerId + 1, "admin"));
    const product = await firstProduct();
    const created = await customer.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "cod" });
    await expect(admin.dashboard.updateShipment({ orderNumber: created.orderNumber, status: "confirmed", trackingUrl: "http://unsafe.example/track" })).rejects.toThrow("HTTPS");
    for (const status of ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const) await admin.dashboard.updateShipment({ orderNumber: created.orderNumber, status });
    await customer.orders.requestReturn({ orderNumber: created.orderNumber, reason: "Changed my mind", refundAmount: created.total, items: [{ productId: product.id, quantity: 1 }] });
    await expect(customer.orders.requestReturn({ orderNumber: created.orderNumber, reason: "Wrong item received", refundAmount: created.total, items: [{ productId: product.id, quantity: 1 }] })).rejects.toThrow("active return request");
  }, 30000);
});
