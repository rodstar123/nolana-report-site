"use client";
import type { ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import NRITooltip from "./NRITooltip";
import QuickReactions from "./QuickReactions";
import Link from "next/link";

const SECTION_COLORS: Record<string, { bg: string; color: string }> = {
  new_business_pulse: { bg: "rgba(13,115,119,0.10)", color: "#0d7377" },
  gov_economic_watch: { bg: "rgba(26,35,50,0.10)", color: "#1a2332" },
  cross_border_trade: { bg: "rgba(196,154,48,0.12)", color: "#8a6c00" },
  community_buzz: { bg: "rgba(99,102,241,0.10)", color: "#4f46e5" },
  industrial_investment: { bg: "rgba(212,168,67,0.15)", color: "#b8860b" },
};

function getNRIStyle(score: number) {
  if (score >= 9)
    return { background: "var(--nri-hot-bg)", color: "var(--nri-hot-color)" };
  if (score >= 7)
    return {
      background: "var(--nri-solid-bg)",
      color: "var(--nri-solid-color)",
    };
  return { background: "var(--nri-mid-bg)", color: "var(--nri-mid-color)" };
}

export interface StoryData {
  id: string;
  headline: string;
  summary: string;
  why_it_matters: string | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  nolana_score: number | null;
  section: string;
  is_free: boolean;
  position: number;
  money_impact: string | null;
  urgency: string | null;
  local_reach: string | null;
  risk: string | null;
  signal?: string;
  who_should_act?: string[];
  smart_move?: string;
  nolana_take?: string;
}

interface Props {
  story: StoryData;
  locked?: boolean;
  movesLocked?: boolean;
}

function SignalIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 4v16" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function SectionField({
  icon,
  iconColor,
  label,
  children,
}: {
  icon: ReactNode;
  iconColor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-5 flex-shrink-0 pt-0.5" style={{ color: iconColor }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium font-body uppercase tracking-[0.3px] text-slate-light dark:text-dark-dim mb-1">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

export function StoryCard({
  story,
  locked = false,
  movesLocked = false,
}: Props) {
  const t = useTranslations("issue");
  const locale = useLocale();
  const valueLabels: Record<string, string> = {
    High: t("subScoreValues.High"),
    Med: t("subScoreValues.Med"),
    Low: t("subScoreValues.Low"),
  };
  const sectionLabel = t.has(`sectionLabels.${story.section}`)
    ? t(`sectionLabels.${story.section}`)
    : story.section;
  const tagStyle = SECTION_COLORS[story.section] ?? {
    bg: "rgba(74,85,104,0.10)",
    color: "#4a5568",
  };
  const isNewFormat = !!story.signal;

  return (
    <article
      className={`bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-7 transition-all duration-200 ${
        locked ? "opacity-60" : "hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-body font-bold uppercase tracking-wide flex-shrink-0"
          style={{ background: tagStyle.bg, color: tagStyle.color }}
        >
          {sectionLabel}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {story.nolana_score && (
            <NRITooltip>
              <span
                className="inline-flex items-center gap-1 font-mono rounded-md px-3 py-1 flex-shrink-0"
                style={getNRIStyle(story.nolana_score)}
              >
                <span className="text-[12px] font-medium opacity-70">NRI</span>
                <span className="text-[16px] font-medium">
                  {story.nolana_score}/10
                </span>
              </span>
            </NRITooltip>
          )}
        </div>
      </div>

      <h3 className="font-display font-bold text-charcoal dark:text-dark-text text-[21px] leading-snug mb-3">
        {story.headline}
      </h3>

      {!locked &&
        (story.money_impact ||
          story.urgency ||
          story.local_reach ||
          story.risk) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {(
              [
                { label: t("subScores.money"), value: story.money_impact },
                { label: t("subScores.urgency"), value: story.urgency },
                { label: t("subScores.reach"), value: story.local_reach },
                { label: t("subScores.risk"), value: story.risk },
              ] as { label: string; value: string | null }[]
            )
              .filter(
                (s): s is { label: string; value: string } => s.value !== null,
              )
              .map((s) => {
                const dotColor =
                  s.value === "High"
                    ? "bg-emerald-500"
                    : s.value === "Med"
                      ? "bg-amber-500"
                      : "bg-gray-400 dark:bg-gray-600";
                const pillStyle =
                  s.value === "High"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : s.value === "Med"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
                return (
                  <span
                    key={s.label}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide ${pillStyle}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                      aria-hidden="true"
                    />
                    <span className="opacity-60 font-medium">{s.label}</span>
                    <span className="font-bold">
                      {valueLabels[s.value] ?? s.value}
                    </span>
                  </span>
                );
              })}
          </div>
        )}

      {locked ? (
        <p className="font-body text-slate-light dark:text-dark-dim italic text-sm">
          {t("upgradeToPro")}
        </p>
      ) : isNewFormat ? (
        <>
          <div className="flex flex-col gap-[14px] mt-4">
            <SectionField
              icon={<SignalIcon />}
              iconColor="#534AB7"
              label={t("theSignal")}
            >
              <p className="font-body text-[16px] text-charcoal dark:text-dark-text leading-[1.75]">
                {story.signal}
              </p>
            </SectionField>

            {story.who_should_act && story.who_should_act.length > 0 && (
              <SectionField
                icon={<UsersIcon />}
                iconColor="#1D9E75"
                label={t("whoShouldAct")}
              >
                <div className="flex flex-wrap gap-1.5">
                  {story.who_should_act.map((tag) => {
                    const cleaned = tag.replace(/\.$/, "");
                    return (
                      <span
                        key={cleaned}
                        className="inline-flex items-center text-xs px-2.5 py-[3px] rounded-md bg-[#E1F5EE] text-[#085041] dark:bg-emerald-900/30 dark:text-emerald-300"
                      >
                        {cleaned}
                      </span>
                    );
                  })}
                </div>
              </SectionField>
            )}

            {story.why_it_matters && (
              <SectionField
                icon={<AlertTriangleIcon />}
                iconColor="#BA7517"
                label={t("whyItMatters")}
              >
                <p className="font-body text-[16px] text-charcoal dark:text-dark-text leading-[1.75]">
                  {story.why_it_matters}
                </p>
              </SectionField>
            )}

            {movesLocked && (
              <div className="mt-2 p-4 bg-gold/5 dark:bg-gold/10 border border-gold/20 dark:border-gold/30 rounded-lg text-center">
                <p className="font-body text-[15px] text-charcoal dark:text-dark-text leading-relaxed mb-1">
                  {t("movesLocked.heading")}
                </p>
                <p className="font-body text-sm text-slate dark:text-dark-muted mb-3">
                  {t("movesLocked.body")}
                </p>
                <Link
                  href="/#pricing"
                  className="inline-block font-body text-sm font-bold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal transition-colors"
                >
                  {t("movesLocked.cta")} →
                </Link>
              </div>
            )}

            {story.smart_move && (
              <SectionField
                icon={<TargetIcon />}
                iconColor="#185FA5"
                label={t("smartMove")}
              >
                <p className="font-body text-[16px] text-charcoal dark:text-dark-text leading-[1.75]">
                  {story.smart_move}
                </p>
              </SectionField>
            )}

            {story.nolana_take && (
              <div className="bg-cream-dark/50 dark:bg-dark-border/30 rounded-lg px-3.5 py-3">
                <p className="text-[13px] font-medium font-body uppercase tracking-[0.3px] text-slate-light dark:text-dark-dim mb-1">
                  {t("nolanaTake")}
                </p>
                <p className="font-editorial italic text-[16px] text-charcoal dark:text-dark-text leading-[1.75]">
                  {story.nolana_take}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-cream-dark/60 dark:border-dark-border/60 flex items-center justify-between gap-3 flex-wrap">
            {story.source_name && (
              <span className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-wide">
                {story.source_url ? (
                  <a
                    href={story.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal transition-colors underline underline-offset-2"
                  >
                    {story.source_name}
                  </a>
                ) : (
                  story.source_name
                )}
              </span>
            )}
            {story.source_url && (
              <a
                href={story.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal transition-colors whitespace-nowrap"
              >
                {t("readFullStory")}
              </a>
            )}
          </div>

          <QuickReactions storyId={story.id} />
        </>
      ) : (
        <>
          <p className="font-editorial text-slate dark:text-dark-muted text-[17px] mb-5 leading-relaxed">
            {story.summary}
          </p>

          {story.why_it_matters && (
            <div className="mt-4 mb-5 pl-4 border-l-[3px] border-teal bg-teal/5 dark:bg-teal/10 rounded-r-md py-3">
              <p className="font-body text-[16px] text-slate dark:text-dark-muted leading-[1.75]">
                <span className="font-semibold text-teal dark:text-teal-light">
                  {t("whyItMattersOld")}
                </span>{" "}
                {story.why_it_matters}
              </p>
            </div>
          )}

          {movesLocked && (
            <div className="mt-2 mb-4 p-4 bg-gold/5 dark:bg-gold/10 border border-gold/20 dark:border-gold/30 rounded-lg text-center">
              <p className="font-body text-[15px] text-charcoal dark:text-dark-text leading-relaxed mb-1">
                {t("movesLocked.heading")}
              </p>
              <p className="font-body text-sm text-slate dark:text-dark-muted mb-3">
                {t("movesLocked.body")}
              </p>
              <Link
                href="/#pricing"
                className="inline-block font-body text-sm font-bold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal transition-colors"
              >
                {t("movesLocked.cta")} →
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
            <div className="flex items-center gap-3 flex-wrap">
              {story.source_name && (
                <span className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-wide">
                  {story.source_url ? (
                    <a
                      href={story.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal transition-colors underline underline-offset-2"
                    >
                      {story.source_name}
                    </a>
                  ) : (
                    story.source_name
                  )}
                </span>
              )}
              {story.source_date && (
                <span className="font-body text-xs text-slate-light dark:text-dark-dim">
                  {new Date(story.source_date).toLocaleDateString(
                    locale === "es" ? "es-MX" : "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
              )}
            </div>
            {story.source_url && (
              <a
                href={story.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal transition-colors whitespace-nowrap"
              >
                {t("readFullStory")}
              </a>
            )}
          </div>

          <QuickReactions storyId={story.id} />
        </>
      )}
    </article>
  );
}
