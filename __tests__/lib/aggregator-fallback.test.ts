import {
  runAggregatorWithFallback,
  PRIMARY_MODEL,
  FALLBACK_MODEL,
} from "@/lib/agents/aggregator-llm";
import { sendTelegram } from "@/lib/agents/alerter";

jest.mock("@/lib/agents/alerter", () => ({
  sendTelegram: jest.fn().mockResolvedValue(undefined),
}));

// Minimal markdown that passes every required-section check in
// missingRequiredSections (headline, opening, business temperature,
// three moves, quiet signal, before you go, >=1 story).
const VALID_MARKDOWN = `## Headline
Test headline for the week

## Opening
Good morning, Valley. Opening text here.

## This Week's Business Temperature: Steady
Body of the temperature section.

## New Business Pulse

### Test Story Headline (NRI: 7/10)
Money: High · Urgency: Med · Reach: High · Risk: Low

SIGNAL: Something concrete happened in McAllen.

WHO SHOULD ACT: retailers, contractors

WHY IT MATTERS: It matters for the test.

SMART MOVE: Do the smart thing this week.

NOLANA TAKE: A take.

Source: [Test Source](https://example.com/story)

## 3 Moves This Week
1. Move one for the test.

## The Quiet Signal
The quiet signal body.

## Before You Go
Closing text for the test.
`;

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  };
}

const refusalBody = {
  stop_reason: "refusal",
  content: [],
  usage: { input_tokens: 100, output_tokens: 5 },
};

const validBody = {
  stop_reason: "end_turn",
  content: [{ type: "text", text: VALID_MARKDOWN }],
  usage: { input_tokens: 100, output_tokens: 500 },
};

const garbageBody = {
  stop_reason: "end_turn",
  content: [{ type: "text", text: "no sections here at all, just prose" }],
  usage: { input_tokens: 100, output_tokens: 50 },
};

function makeSupabase() {
  const inserts: Array<{ model: string; payload: Record<string, unknown> }> =
    [];
  const supabase = {
    from: jest.fn(() => ({
      insert: jest.fn(
        (row: { model: string; payload: Record<string, unknown> }) => {
          inserts.push(row);
          return Promise.resolve({ error: null });
        },
      ),
    })),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { supabase: supabase as any, inserts };
}

describe("runAggregatorWithFallback", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    (sendTelegram as jest.Mock).mockClear();
  });

  function modelOfCall(callIndex: number): string {
    return JSON.parse(fetchMock.mock.calls[callIndex][1].body).model;
  }

  it("accepts a valid primary response without fallback", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validBody));
    const { supabase, inserts } = makeSupabase();

    const { chosen, fallbackFired } = await runAggregatorWithFallback(
      "user message",
      supabase,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(modelOfCall(0)).toBe(PRIMARY_MODEL);
    expect(fallbackFired).toBe(false);
    expect(chosen.model).toBe(PRIMARY_MODEL);
    expect(chosen.parsed?.stories.length).toBe(1);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].payload.outcome).toBe("accepted");
    expect(sendTelegram).not.toHaveBeenCalled();
  });

  it("routes a refusal to the Opus retry", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(refusalBody))
      .mockResolvedValueOnce(jsonResponse(validBody));
    const { supabase, inserts } = makeSupabase();

    const { chosen, fallbackFired } = await runAggregatorWithFallback(
      "user message",
      supabase,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(modelOfCall(0)).toBe(PRIMARY_MODEL);
    expect(modelOfCall(1)).toBe(FALLBACK_MODEL);
    expect(fallbackFired).toBe(true);
    expect(chosen.model).toBe(FALLBACK_MODEL);
    expect(inserts).toHaveLength(2);
    expect(inserts[0].payload.outcome).toBe("rejected: refusal");
    expect(inserts[1].payload.outcome).toBe("fallback_accepted");
    expect(sendTelegram).toHaveBeenCalledTimes(1);
    expect((sendTelegram as jest.Mock).mock.calls[0][0]).toContain("refusal");
  });

  it("routes an unparseable response to the Opus retry", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(garbageBody))
      .mockResolvedValueOnce(jsonResponse(validBody));
    const { supabase, inserts } = makeSupabase();

    const { chosen, fallbackFired } = await runAggregatorWithFallback(
      "user message",
      supabase,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(modelOfCall(0)).toBe(PRIMARY_MODEL);
    expect(modelOfCall(1)).toBe(FALLBACK_MODEL);
    expect(fallbackFired).toBe(true);
    expect(chosen.model).toBe(FALLBACK_MODEL);
    expect(inserts[0].payload.outcome).toContain("parse failure");
    expect(inserts[1].payload.outcome).toBe("fallback_accepted");
    expect(sendTelegram).toHaveBeenCalledTimes(1);
    expect((sendTelegram as jest.Mock).mock.calls[0][0]).toContain(
      "parse failure",
    );
  });

  it("throws when both models refuse", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(refusalBody))
      .mockResolvedValueOnce(jsonResponse(refusalBody));
    const { supabase, inserts } = makeSupabase();

    await expect(
      runAggregatorWithFallback("user message", supabase),
    ).rejects.toThrow("Both models failed");
    expect(inserts).toHaveLength(2);
  });
});
