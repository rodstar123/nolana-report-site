import { SVGProps } from "react";

/**
 * BrandMark — The Nolana Report intelligence network mark.
 *
 * A 270° detection arc (gap opens right) + focal point dot.
 * Two shapes. One color. No gradients.
 *
 * Usage:
 *   Nav:    <BrandMark size={18} className="text-gold" />
 *   Hero:   <BrandMark size={32} color="#d4a843" />
 *   Avatar: <BrandMark size={80} color="#d4a843" /> on dark square
 *   16px:   <BrandMark size={16} strokeWidth={3} />
 */

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

export function BrandMark({
  size = 24,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: Props) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Detection arc — 270°, gap at right. Sweeps lower-right → bottom → left → top → upper-right */}
      <path
        d="M18.36 18.36A9 9 0 1 1 18.36 5.64"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Signal — focal point at detection center */}
      <circle cx="12" cy="12" r="2.5" fill={color} />
    </svg>
  );
}
