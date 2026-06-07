const sharp = require("sharp");
const path = require("path");

const SOURCE = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "NR Logo Remove.png",
);

async function generate() {
  await sharp(SOURCE)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(__dirname, "..", "app", "favicon.ico"));

  await sharp(SOURCE)
    .resize(192, 192, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(__dirname, "..", "app", "icon.png"));

  await sharp(SOURCE)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(__dirname, "..", "app", "apple-icon.png"));

  console.log("Generated: app/favicon.ico, app/icon.png, app/apple-icon.png");
}

generate().catch(console.error);
