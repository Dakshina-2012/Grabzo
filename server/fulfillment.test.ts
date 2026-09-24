import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(id: number, role: "user" | "vendor" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id,
      openId: `fulfillment-${id}`,
      name: role === "admin" ? "Grabzo Admin" : "Fulfillment Shopper",
      email: `fulfillment-${id}@example.com`,
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
  name: "Fulfillment Shopper",
  phone: "9999999999",
  house: "10",
  street: "Grabzo Lane",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
};

async function product() {
  const caller = appRouter.createCaller(context(999001));
  return (await caller.catalog.products({ limit: 1 }))[0];
}

describe("fulfillment tracking and notifications", () => {
  it("records order events and creates an unread confirmation notification", async () => {
    const customerId = 999100 + Math.floor(Math.random() * 500);
    const caller = appRouter.createCaller(context(customerId));
    const item = await product();
    const created = await caller.orders.create({ items: [{ productId: item.id, quantity: 1 }], address, paymentMethod: "cod" });

    const events = await caller.orders.events({ orderNumber: created.orderNumber });
    const notifications = await caller.notifications.list();
    const count = await caller.notifications.unreadCount();

    expect(events[0]?.status).toBe("placed");
    expect(notifications.some(notification => notification.orderId === created.orderId && notification.title === "Order confirmed")).toBe(true);
    expect(count).toBeGreaterThan(0);

    await caller.notifications.markRead({});
    expect(await caller.notifications.unreadCount()).toBe(0);
  }, 15000);

  it("lets an admin advance shipment status and exposes the customer-facing event history", async () => {
    const customerId = 999700 + Math.floor(Math.random() * 200);
    const customer = appRouter.createCaller(context(customerId));
    const admin = appRouter.createCaller(context(customerId + 1, "admin"));
    const item = await product();
    const created = await customer.orders.create({ items: [{ productId: item.id, quantity: 1 }], address, paymentMethod: "upi" });

    await admin.dashboard.updateShipment({ orderNumber: created.orderNumber, status: "confirmed", note: "Seller has confirmed the order." });
    await admin.dashboard.updateShipment({ orderNumber: created.orderNumber, status: "shipped", note: "Handed to the courier." });

    const detail = await customer.orders.get({ orderNumber: created.orderNumber });
    const events = await customer.orders.events({ orderNumber: created.orderNumber });
    const notifications = await customer.notifications.list();

    expect(detail?.status).toBe("shipped");
    expect(events.map(event => event.status)).toEqual(["placed", "confirmed", "shipped"]);
    expect(notifications.filter(notification => notification.orderId === created.orderId).map(notification => notification.title)).toEqual(expect.arrayContaining(["Order confirmed", "Order shipped"]));
    await expect(admin.dashboard.updateShipment({ orderNumber: created.orderNumber, status: "packed" })).rejects.toThrow("only move forward");
  }, 20000);

  it("does not expose shipment management to a customer account", async () => {
    const customer = appRouter.createCaller(context(999900, "user"));
    await expect(customer.dashboard.shipments()).rejects.toThrow("Vendor access is required");
    await expect(customer.dashboard.updateShipment({ orderNumber: "GZ-NOT-REAL", status: "shipped" })).rejects.toThrow("Vendor access is required");
  });
});
