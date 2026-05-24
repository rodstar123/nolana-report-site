import { NextRequest, NextResponse } from "next/server";
import { writeSubscriber } from "@/lib/notion";
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

  try {
    await writeSubscriber(email.toLowerCase().trim());
    await sendConfirmationEmail(email.toLowerCase().trim());
    return NextResponse.json({ success: true, message: "Check your inbox." });
  } catch (err) {
    console.error("[subscribe] error:", err);
    return NextResponse.json(
      { error: "Subscription failed — try again." },
      { status: 500 },
    );
  }
}
