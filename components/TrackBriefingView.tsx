"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  issueSlug: string;
  issueTitle: string;
  tier?: string;
}

export function TrackBriefingView({ issueSlug, issueTitle, tier }: Props) {
  useEffect(() => {
    trackEvent("briefing_viewed", {
      issue_id: issueSlug,
      issue_title: issueTitle,
      tier: tier ?? "anonymous",
    });
  }, [issueSlug, issueTitle, tier]);

  return null;
}
