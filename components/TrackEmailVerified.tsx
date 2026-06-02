"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function TrackEmailVerified() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      trackEvent("email_verified", { source: "magic_link" });
      window.history.replaceState({}, "", "/account");
    }
  }, [searchParams]);

  return null;
}
