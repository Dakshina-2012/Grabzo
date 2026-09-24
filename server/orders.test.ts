import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 987654321,
      openId: "orders-test-user",
      name: "Orders Test User",
      email: "orders-test@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const address = {
  name: "Orders Test User",
  phone: "9999999999",
  house: "10",
  street: "Grabzo Lane",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
};

describe("order payment confirmation", () => {
  it("marks online checkout as completed and returns a payment reference", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const [product] = await caller.catalog.products({ limit: 1 });
    const result = await caller.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "upi" });

    expect(result.paymentStatus).toBe("completed");
    expect(result.paymentReference).toMatch(/^GZPAY-/);
    expect(result.paymentMethod).toBe("upi");
    expect(result.items).toHaveLength(1);
    expect(result.address).toEqual(address);
  }, 15000);

  it("marks cash on delivery as pending and explains payment is due later", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const [product] = await caller.catalog.products({ limit: 1 });
    const result = await caller.orders.create({ items: [{ productId: product.id, quantity: 1 }], address, paymentMethod: "cod" });
    const orders = await caller.orders.list();
    const savedOrder = orders.find(order => order.orderNumber === result.orderNumber);

    expect(result.paymentStatus).toBe("pending");
    expect(result.paymentReference).toMatch(/^COD-/);
    expect(savedOrder?.paymentStatus).toBe("pending");
    expect(savedOrder?.paymentMethod).toBe("cod");
  });
});
