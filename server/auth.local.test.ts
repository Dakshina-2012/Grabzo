import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { verifyPassword } from "./auth";
import type { TrpcContext } from "./_core/context";

type CookieCall = { name: string; value?: string; options: Record<string, unknown> };

function createContext() {
  const cookies: CookieCall[] = [];
  const cleared: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }),
      clearCookie: (name: string, options: Record<string, unknown>) => cleared.push({ name, options }),
    } as TrpcContext["res"],
  };
  return { ctx, cookies, cleared };
}

describe("native Grabzo authentication", () => {
  it("registers a local account, hashes the password, and creates a session", async () => {
    const email = `grabzo-${randomUUID()}@example.com`;
    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({ name: "New Grabzo User", email, password: "Correct Horse Battery 9" });

    expect(result.success).toBe(true);
    expect(result.user.loginMethod).toBe("grabzo");
    expect(result.user.passwordHash).toMatch(/^scrypt\$/);
    expect(await verifyPassword("Correct Horse Battery 9", result.user.passwordHash)).toBe(true);
    expect(await verifyPassword("wrong password", result.user.passwordHash)).toBe(false);
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.value).toBeTruthy();
  }, 30_000);

  it("logs in with valid credentials and rejects invalid credentials generically", async () => {
    const email = `grabzo-${randomUUID()}@example.com`;
    const registration = createContext();
    await appRouter.createCaller(registration.ctx).auth.register({ name: "Login Test User", email, password: "Correct Horse Battery 9" });

    const login = createContext();
    const result = await appRouter.createCaller(login.ctx).auth.login({ email, password: "Correct Horse Battery 9" });
    expect(result.success).toBe(true);
    expect(login.cookies[0]?.value).toBeTruthy();

    await expect(appRouter.createCaller(createContext().ctx).auth.login({ email, password: "not-the-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(appRouter.createCaller(createContext().ctx).auth.login({ email: `missing-${email}`, password: "not-the-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  }, 30_000);

  it("rejects duplicate local email registration and clears the session on logout", async () => {
    const email = `grabzo-${randomUUID()}@example.com`;
    const first = createContext();
    await appRouter.createCaller(first.ctx).auth.register({ name: "Duplicate Test User", email, password: "Correct Horse Battery 9" });
    await expect(appRouter.createCaller(createContext().ctx).auth.register({ name: "Duplicate Test User", email, password: "Correct Horse Battery 9" })).rejects.toMatchObject({ code: "CONFLICT" });

    const logout = createContext();
    const result = await appRouter.createCaller(logout.ctx).auth.logout();
    expect(result).toEqual({ success: true });
    expect(logout.cleared).toHaveLength(1);
  }, 30_000);
});
