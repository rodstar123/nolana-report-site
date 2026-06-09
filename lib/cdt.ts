const TZ = "America/Chicago";
const fmtDate = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });

/** YYYY-MM-DD in CDT/CST (handles DST automatically). */
export function cdtSlug(d = new Date()): string {
  return fmtDate.format(d);
}

/** Day of week in CDT: 0=Sun, 1=Mon, … 6=Sat. */
export function cdtDay(d = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}

/** Midnight CDT/CST as a UTC Date (for DB range queries). */
export function cdtStartOfDay(d = new Date()): Date {
  const slug = cdtSlug(d);
  const cdtMidnight = new Date(`${slug}T05:00:00Z`);
  if (cdtSlug(cdtMidnight) === slug) return cdtMidnight;
  return new Date(`${slug}T06:00:00Z`);
}
