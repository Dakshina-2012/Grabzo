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
    expect(products.every(product => product.isFeatured)).toBe(true);
  });

  it("exposes the expanded catalog with unique product galleries", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const products = await caller.catalog.products({ limit: 60 });
    const slugs = new Set(products.map(product => product.slug));
    const galleries = products.map(product => product.images.slice(0, 2).join("|"));

    expect(products.length).toBeGreaterThanOrEqual(36);
    expect(slugs.size).toBe(products.length);
    expect(new Set(galleries).size).toBe(products.length);
    expect(products.every(product => product.images.length >= 2)).toBe(true);
  });

  it("caps New Arrivals at twelve products", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const arrivals = await caller.catalog.products({ sort: "newest", limit: 12 });

    expect(arrivals).toHaveLength(12);
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
