import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;

  const body = (await req.json()) as {
    what_happened: string;
    location?: string;
    when_observed?: string;
    submitter_name?: string;
  };

  if (!body.what_happened?.trim()) {
    return NextResponse.json(
      { error: "what_happened is required" },
      { status: 400 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Resolve subscriber_id if logged in
  let subscriberId: string | null = null;
  if (session?.user?.email) {
    const { data } = await admin
      .from("subscribers")
      .select("id")
      .eq("email", session.user.email)
      .single();
    subscriberId = data?.id ?? null;
  }

  const { error } = await admin.from("tips").insert({
    subscriber_id: subscriberId,
    what_happened: body.what_happened.trim(),
    location: body.location?.trim() || null,
    when_observed: body.when_observed || null,
    submitter_name: body.submitter_name?.trim() || null,
  });

  if (error) {
    // Graceful fallback: when_observed or submitter_name column may not exist yet
    if (
      error.message.includes("when_observed") ||
      error.message.includes("submitter_name")
    ) {
      const { error: retryError } = await admin.from("tips").insert({
        subscriber_id: subscriberId,
        what_happened: body.what_happened.trim(),
        location: body.location?.trim() || null,
      });
      if (retryError) {
        console.error("[signals] insert error:", retryError);
        return NextResponse.json({ error: "Submit failed" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    console.error("[signals] insert error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
