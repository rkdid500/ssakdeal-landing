import { SITE } from "@/lib/site-config";

/** 싹딜 wordmark. `tone="light"` is the white-lettered version for dark backgrounds. */
export function BrandLogo({ height = 28, tone = "light" }: { height?: number; tone?: "light" | "color" }) {
  const src = tone === "light" ? "/assets/brand/logo-white.webp" : "/assets/brand/logo-color.webp";
  return (
    <img
      alt={SITE.name}
      className="brand-logo"
      decoding="async"
      height={height}
      src={src}
      style={{ height, width: "auto" }}
      width={Math.round(height * 1.98)}
    />
  );
}
