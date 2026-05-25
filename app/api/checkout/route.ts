import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const body = (await req.json()) as {
      priceId?: string;
      plan?: string;
      email: string;
    };

    const { email } = body;

    // Resolve priceId from plan name (server-side) or accept direct priceId
    let priceId = body.priceId ?? "";
    if (body.plan === "pro") {
      priceId =
        process.env.STRIPE_FOUNDING_PRO_PRICE_ID ??
        process.env.STRIPE_PRO_PRICE_ID ??
        "";
    } else if (body.plan === "intel") {
      priceId = process.env.STRIPE_INTEL_PRICE_ID ?? "";
    } else if (body.plan === "pro-yearly") {
      priceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "";
    } else if (body.plan === "intel-yearly") {
      priceId = process.env.STRIPE_INTEL_YEARLY_PRICE_ID ?? "";
    }

    if (!priceId || !email) {
      return NextResponse.json(
        { error: "priceId and email required" },
        { status: 400 },
      );
    }

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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      metadata: { email },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
