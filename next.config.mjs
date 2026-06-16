import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp"],
  },
  env: {
    BUILD_TIMESTAMP: new Date().toISOString().slice(0, 10),
  },
};

export default withNextIntl(nextConfig);
