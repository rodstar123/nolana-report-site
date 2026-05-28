import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const PROMPT = `Photorealistic product photograph of an Apple iPhone 16 Pro in Natural Titanium finish, floating at a slight angle tilted 5 degrees to the left. The screen displays a professional email newsletter: at the top is a dark navy header bar with gold serif text reading "THE NOLANA REPORT" and a small gold arc-and-dot logo mark beside it, below that a subheading "RGV Business Intelligence" in small gray text, then a row of news story cards each with a small colored square score badge (gold badge showing "91", teal badge showing "84") and bold black headlines about South Texas business news. The email has a clean white background with subtle gray divider lines between stories. Studio lighting from upper left casting a soft diffused shadow beneath and to the right of the device. The phone floats against a solid dark navy background, hex color 0A1628. No hands, no other objects. Ultra-sharp detail on the titanium frame chamfered edges and the Dynamic Island pill at top center of the screen. Professional product photography, 4K quality.`;

async function main() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY not set");
    process.exit(1);
  }

  console.log(
    "Generating iPhone 16 Pro mockup via gemini-2.5-flash-image...\n",
  );
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
    generationConfig: {
      // @ts-expect-error — image gen responseModalities not in SDK types
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  try {
    const result = await model.generateContent(PROMPT);
    const response = result.response;
    let imageCount = 0;

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageCount++;
          const buf = Buffer.from(part.inlineData.data, "base64");
          const ext = part.inlineData.mimeType?.includes("webp")
            ? "webp"
            : "png";
          const filename = `public/images/hero-iphone-mockup${imageCount > 1 ? `-${imageCount}` : ""}.${ext}`;
          fs.writeFileSync(filename, buf);
          console.log(
            `Saved: ${filename} (${Math.round(buf.length / 1024)}KB, ${part.inlineData.mimeType})`,
          );
        }
        if (part.text) {
          console.log(`AI note: ${part.text.slice(0, 300)}`);
        }
      }
    }

    if (imageCount === 0) {
      console.error("No images in response.");
      const textParts = response.candidates?.[0]?.content?.parts?.filter(
        (p) => p.text,
      );
      if (textParts?.length) {
        console.log("Text response:", textParts.map((p) => p.text).join("\n"));
      }
    } else {
      console.log(`\nDone! ${imageCount} image(s) generated.`);
    }
  } catch (err: any) {
    console.error("Failed:", err.message?.slice(0, 300));
  }
}

main();
