import { NextRequest, NextResponse } from "next/server";
import { sendBreakingAlert } from "@/lib/alerts/breaking-news";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendBreakingAlert({
    title: "TEST: McAllen EDC Announces $15M Industrial Park Expansion",
    summary:
      "The McAllen Economic Development Corporation approved a $15 million expansion " +
      "of the McAllen Foreign Trade Zone industrial park, expected to create 200+ jobs " +
      "in advanced manufacturing. Construction begins Q3 2026.",
    score: 97,
    category: "Grant",
    source: "Test Alert",
    url: "https://www.nolanareport.com",
    agent: "Agent 2",
  });

  return NextResponse.json({
    ok: true,
    test: true,
    ...result,
  });
}
