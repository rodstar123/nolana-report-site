import { POST } from "@/app/api/subscribe/route";
import { NextRequest } from "next/server";

// Chainable Supabase stub: every query resolves to "no existing row",
// every write succeeds.
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: null }),
      })),
    })),
    upsert: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })),
  })),
};

jest.mock("@/lib/signup-guards", () => {
  const actual = jest.requireActual("@/lib/signup-guards");
  return {
    ...actual,
    getAdminClient: jest.fn(() => mockSupabase),
    checkRateLimit: jest.fn().mockResolvedValue(false),
    isBlockedDomain: jest.fn().mockResolvedValue(false),
    isDomainBurst: jest.fn().mockResolvedValue(false),
    logBlockedSignup: jest.fn().mockResolvedValue(undefined),
  };
});
jest.mock("@/lib/email/verification", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("POST /api/subscribe", () => {
  it("returns 200 for valid email", async () => {
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.reason).toBe("pending_confirmation");
  });

  it("returns 400 for missing email", async () => {
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
