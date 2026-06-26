import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/validations/lead";

describe("leadSchema", () => {
  it("accepts valid lead", () => {
    const result = leadSchema.safeParse({
      client_name: "John",
      company_name: "Acme",
      phone: "+971501234567",
      email: "john@acme.com",
      service_requested: "Digital Marketing",
      source_page: "/contact",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = leadSchema.safeParse({
      client_name: "John",
      company_name: "Acme",
      phone: "+971501234567",
      email: "not-an-email",
      service_requested: "Digital Marketing",
      source_page: "/contact",
    });

    expect(result.success).toBe(false);
  });
});
