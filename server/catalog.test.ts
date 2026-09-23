import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("catalog procedures", () => {
  it("returns a seeded featured product collection", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const products = await caller.catalog.products({ featured: true, limit: 8 });

    expect(products.length).toBeGreaterThan(0);
    expect(products.every(product => product.images.length > 0)).toBe(true);
    expect(products.some(product => product.name.includes("WH-1000XM5"))).toBe(true);
  });

  it("finds products by search term across the catalog", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const products = await caller.catalog.products({ search: "wireless", limit: 10 });

    expect(products.length).toBeGreaterThan(0);
    expect(products.some(product => product.name.toLowerCase().includes("wireless"))).toBe(true);
  });

  it("returns product detail with normalized gallery and specifications", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const product = await caller.catalog.bySlug({ slug: "sony-wh-1000xm5" });

    expect(product).toBeDefined();
    expect(product?.images).toHaveLength(2);
    expect(product?.specifications).toMatchObject({ Battery: "Up to 30 hours" });
  });
});
