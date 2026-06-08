import Image from "next/image";
import { PUBLISHER_URL } from "@/lib/constants";

export default function NBCBanner() {
  return (
    <div className="nbc-banner">
      {/* Gold-to-teal gradient border */}
      <div className="nbc-banner__border" />

      {/* Left accent bar */}
      <div className="nbc-banner__accent" />

      {/* Content */}
      <div className="nbc-banner__content">
        <div className="nbc-banner__label">From the Publisher</div>

        <h3 className="nbc-banner__headline">Your books, handled.</h3>

        <div className="nbc-banner__desc">
          National Bookkeeping Company® —{" "}
          <strong className="nbc-banner__smartbook">SmartBook</strong>{" "}
          bookkeeping for Valley businesses starting at $350/mo
        </div>

        <a
          href={PUBLISHER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nbc-banner__cta"
        >
          Explore Services →
        </a>
      </div>

      {/* Image panel — right side (top on mobile) */}
      <div className="nbc-banner__image-wrap">
        <Image
          src="/images/nbc-office.webp"
          alt="National Bookkeeping Company office"
          width={600}
          height={360}
          className="nbc-banner__image"
        />
        <div className="nbc-banner__image-fade" />
      </div>
    </div>
  );
}
