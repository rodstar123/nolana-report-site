import { Client } from "@notionhq/client";
import { v4 as uuidv4 } from "uuid";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_SUBSCRIBERS_DB!;

export type SubscriberLookup = {
  status: string;
  token: string;
} | null;

export async function lookupSubscriber(
  email: string,
): Promise<SubscriberLookup> {
  // Use raw REST — this SDK (v5) doesn't expose databases.query
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DB_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { property: "Email", title: { equals: email } },
        page_size: 1,
      }),
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    results: Array<{
      properties: {
        Status?: { select?: { name?: string } };
        Token?: { rich_text?: Array<{ plain_text?: string }> };
      };
    }>;
  };

  if (data.results.length === 0) return null;

  const props = data.results[0].properties;
  const status = props.Status?.select?.name ?? "";
  const token = props.Token?.rich_text?.[0]?.plain_text ?? "";

  return { status, token };
}

export async function writeSubscriber(
  email: string,
): Promise<{ token: string }> {
  const token = uuidv4();
  await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: {
      Email: { title: [{ text: { content: email } }] },
      Status: { select: { name: "pending" } },
      Tier: { select: { name: "free" } },
      Token: { rich_text: [{ text: { content: token } }] },
      Language: { select: { name: "EN" } },
      "Subscribed Date": {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    },
  });
  return { token };
}
