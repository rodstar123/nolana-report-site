import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

async function sendPushover(
  email: string,
  planName: string,
  amount: string,
): Promise<void> {
  const token = process.env.PUSHOVER_API_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;
  if (!token || !user) return;
  try {
    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        user,
        message: `💰 New subscriber! ${email} just subscribed to ${planName} (${amount})`,
        title: "🔔 Nolana Report — New Sale!",
        sound: "cashregister",
        priority: 1,
        url: "https://dashboard.stripe.com/payments",
        url_title: "Open Stripe Dashboard",
      }),
    });
  } catch (err) {
    console.error("[pushover] notification failed:", err);
  }
}

function getTierFromPriceId(priceId: string): string {
  const proIds = [
    process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_FOUNDING_PRO_PRICE_ID,
  ];
  const intelIds = [process.env.STRIPE_INTEL_PRICE_ID];
  if (proIds.includes(priceId)) return "pro";
  if (intelIds.includes(priceId)) return "intel";
  return "free";
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const email = session.customer_email ?? session.customer_details?.email;

      if (!email) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);
      const rawEnd = (subscription as unknown as { current_period_end: number })
        .current_period_end;
      const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;

      const { data: existing } = await supabase
        .from("subscribers")
        .select("stripe_subscription_id")
        .eq("email", email)
        .maybeSingle();
      const isNewSub = existing?.stripe_subscription_id !== subscriptionId;

      await supabase
        .from("subscribers")
        .update({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          current_period_end: periodEnd,
          tier_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (isNewSub) {
        const price = subscription.items.data[0]?.price;
        const amount = price?.unit_amount
          ? `$${(price.unit_amount / 100).toFixed(2)}`
          : "unknown";
        const interval = price?.recurring?.interval === "year" ? "/yr" : "/mo";
        const planLabel = `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${interval}`;
        await sendPushover(email, planLabel, `${amount}${interval}`);
      }

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);
      const rawEnd2 = (
        subscription as unknown as { current_period_end: number }
      ).current_period_end;
      const periodEnd = rawEnd2 ? new Date(rawEnd2 * 1000).toISOString() : null;

      await supabase
        .from("subscribers")
        .update({
          tier,
          current_period_end: periodEnd,
          tier_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscribers")
        .update({
          tier: "free",
          stripe_subscription_id: null,
          current_period_end: null,
          tier_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(`Payment failed for customer: ${invoice.customer}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
