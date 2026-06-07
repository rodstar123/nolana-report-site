const sharp = require("sharp");
const path = require("path");

const SOURCE = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "NR Logo Remove.png",
);
const OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "nr-logo-transparent.png",
);

async function removeWhiteBG() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(OUTPUT);

  console.log("Saved transparent logo to", OUTPUT);
}

removeWhiteBG();
