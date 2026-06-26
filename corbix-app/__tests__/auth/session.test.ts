import { describe, expect, it } from "vitest";
import { validateAdminCredentials } from "@/lib/auth/session";

describe("validateAdminCredentials", () => {
  it("returns true for matching credentials", () => {
    process.env.ADMIN_EMAIL = "admin@test.com";
    process.env.ADMIN_PASSWORD = "secret123";

    expect(validateAdminCredentials("admin@test.com", "secret123")).toBe(true);
  });

  it("returns false for wrong password", () => {
    process.env.ADMIN_EMAIL = "admin@test.com";
    process.env.ADMIN_PASSWORD = "secret123";

    expect(validateAdminCredentials("admin@test.com", "wrong")).toBe(false);
  });
});
