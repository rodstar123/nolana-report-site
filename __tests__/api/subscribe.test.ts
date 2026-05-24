import { POST } from "@/app/api/subscribe/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/notion", () => ({
  writeSubscriber: jest.fn().mockResolvedValue({ token: "test-uuid" }),
}));
jest.mock("@/lib/resend", () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
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
    expect(json.success).toBe(true);
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
