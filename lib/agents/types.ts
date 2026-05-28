export type AgentName =
  | "Agent 1"
  | "Agent 2"
  | "Agent 3"
  | "Agent 4"
  | "Agent 5";

export type AgentSlug =
  | "business-pulse"
  | "gov-watch"
  | "cross-border"
  | "community-buzz"
  | "industrial-investment";

export const AGENT_SLUG_TO_NAME: Record<AgentSlug, AgentName> = {
  "business-pulse": "Agent 1",
  "gov-watch": "Agent 2",
  "cross-border": "Agent 3",
  "community-buzz": "Agent 4",
  "industrial-investment": "Agent 5",
};

export const AGENT_NAME_TO_SLUG: Record<AgentName, AgentSlug> = {
  "Agent 1": "business-pulse",
  "Agent 2": "gov-watch",
  "Agent 3": "cross-border",
  "Agent 4": "community-buzz",
  "Agent 5": "industrial-investment",
};

export const SECTION_ENUM: Record<AgentName, string> = {
  "Agent 1": "new_business_pulse",
  "Agent 2": "gov_economic_watch",
  "Agent 3": "cross_border_trade",
  "Agent 4": "community_buzz",
  "Agent 5": "industrial_investment",
};

export type Category =
  | "New Open"
  | "Closing"
  | "Permit"
  | "City Council"
  | "Grant"
  | "Zoning"
  | "Tariff"
  | "Bridge"
  | "FX"
  | "Buzz"
  | "Event"
  | "Other";

export interface SourceConfig {
  name: string;
  url: string;
  type: "rss" | "json" | "scraper";
}

export interface RawItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  original_date: string;
  agent: AgentName;
}

export interface ScoredItem {
  score: number;
  category: Category | string;
  summary: string;
  language: "EN" | "ES";
  tokens: number;
}

export interface FetchResult {
  source: SourceConfig;
  ok: boolean;
  items: RawItem[];
  error: string | null;
  responseMs: number;
}

export interface FullTextResult {
  text: string | null;
  method: "firecrawl" | "bright_data" | "none";
}

export interface PipelineError {
  ts: string;
  agent: string;
  source: string | null;
  type: "fetch" | "parse" | "score" | "db" | "alert";
  message: string;
  context?: Record<string, unknown>;
}

export interface AgentRunStats {
  agent: AgentName;
  runStartedAt: string;
  runFinishedAt?: string;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  itemsFetched: number;
  itemsNew: number;
  itemsScored: number;
  itemsIngested: number;
  tokensUsed: number;
  errors: PipelineError[];
}
