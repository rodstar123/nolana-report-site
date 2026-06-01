import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function resolvePriceId(plan?: string, priceId?: string): string {
  if (plan === "pro")
    return (
      process.env.STRIPE_FOUNDING_PRO_PRICE_ID ??
      process.env.STRIPE_PRO_PRICE_ID ??
      ""
    );
  if (plan === "intel") return process.env.STRIPE_INTEL_PRICE_ID ?? "";
  if (plan === "pro-yearly")
    return process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "";
  if (plan === "intel-yearly")
    return process.env.STRIPE_INTEL_YEARLY_PRICE_ID ?? "";
  return priceId ?? "";
}

async function createCheckoutSession(
  plan?: string,
  priceId?: string,
  email?: string,
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const resolved = resolvePriceId(plan, priceId);

  if (!resolved) {
    return { error: "Valid plan or priceId required", status: 400 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nolanareport.com";
  const sessionOpts: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: resolved, quantity: 1 }],
    success_url: `${baseUrl}/account?upgraded=true`,
    cancel_url: `${baseUrl}/#pricing`,
  };

  if (email) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("email", email)
      .single();

    let customerId = subscriber?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      await supabase
        .from("subscribers")
        .update({ stripe_customer_id: customerId })
        .eq("email", email);
    }

    sessionOpts.customer = customerId;
    sessionOpts.metadata = { email };
  } else {
    sessionOpts.customer_creation = "always";
  }

  const session = await stripe.checkout.sessions.create(sessionOpts);
  return { url: session.url };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan") ?? undefined;
  const email = searchParams.get("email") ?? undefined;

  try {
    const result = await createCheckoutSession(plan, undefined, email);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.redirect(result.url!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      priceId?: string;
      plan?: string;
      email?: string;
    };

    const result = await createCheckoutSession(
      body.plan,
      body.priceId,
      body.email,
    );
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ url: result.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
