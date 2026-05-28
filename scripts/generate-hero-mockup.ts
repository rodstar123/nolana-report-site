import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const PROMPT = `Product photograph of an Apple iPhone 16 Pro in Natural Titanium finish against a solid dark navy background, exact hex color #0A1628, completely uniform with no gradient and no texture. The phone is shown at a very slight angle, almost straight-on, tilted just 3 degrees to the left for depth. A second iPhone 16 Pro is partially visible behind and to the left, showing the back with the camera module and Apple logo, creating a layered dual-phone composition. The front phone's screen displays a crisp professional email newsletter: a dark navy header with gold serif capital letter "N" and text "THE NOLANA REPORT" in gold, then a line "RGV Business Intelligence" in small gray text underneath, then multiple news story cards with small square score badges — a gold badge showing "91" next to headline "South Texas Innovation Hub expands with new tech campus" and a teal badge showing "84" next to headline "Cross-border trade agreements boost regional economy". The email body has a clean white background with thin gray divider lines between cards. Ultra-sharp detail on the titanium chamfered edges, the Dynamic Island pill centered at the top of the screen, and camera lenses on the back phone. The phones should feel large, bold, and tangible — like you could reach out and grab them. Studio-quality lighting from above-left. The background must be a single solid flat color #0A1628 with absolutely no variation. Product photography, 4K, professional.`;

async function main() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY not set");
    process.exit(1);
  }

  console.log("Generating iPhone 16 Pro mockup via Nano Banana Pro...\n");
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-image-preview",
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
          const filename = `public/images/hero-iphone-mockup-v2${imageCount > 1 ? `-${imageCount}` : ""}.${ext}`;
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
      console.error("No images generated.");
    } else {
      console.log(`\nDone! ${imageCount} image(s) generated.`);
    }
  } catch (err: any) {
    console.error("Failed:", err.message?.slice(0, 400));
  }
}

main();
