import { Client } from "@notionhq/client";
import { v4 as uuidv4 } from "uuid";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_SUBSCRIBERS_DB!;

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
