import { NextRequest, NextResponse } from "next/server";
import { lookupSubscriber, writeSubscriber } from "@/lib/notion";
import { sendConfirmationEmail } from "@/lib/resend";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  const normalized = email.toLowerCase().trim();

  try {
    const existing = await lookupSubscriber(normalized);

    if (existing?.status === "active") {
      return NextResponse.json({ ok: false, reason: "already_subscribed" });
    }

    if (existing?.status === "pending") {
      await sendConfirmationEmail(normalized);
      return NextResponse.json({ ok: false, reason: "pending_confirmation" });
    }

    // New subscriber
    await writeSubscriber(normalized);
    await sendConfirmationEmail(normalized);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] error:", err);
    return NextResponse.json(
      { ok: false, error: "Subscription failed — try again." },
      { status: 500 },
    );
  }
}
