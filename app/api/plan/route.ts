import { NextResponse } from "next/server";
import { DEMO_STATEMENT, computePayouts } from "@/lib/statement";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const instruction =
    typeof body.instruction === "string" ? body.instruction : "";
  const payouts = computePayouts(DEMO_STATEMENT);

  // The splits are arithmetic and always computed deterministically.
  // The language model only writes the plain-language explanation of the plan.
  let explanation: string;
  let explanationSource: "nebius" | "rules";
  const apiKey = process.env.NEBIUS_API_KEY;
  const apiBase =
    process.env.NEBIUS_API_BASE || "https://api.tokenfactory.nebius.com/v1";
  const model =
    process.env.NEBIUS_MODEL || "nvidia/nemotron-3-super-120b-a12b";

  const rulesExplanation =
    `Paying out ${DEMO_STATEMENT.period} royalties for "${DEMO_STATEMENT.track}" ` +
    `(${DEMO_STATEMENT.totalUsd.toFixed(2)} ${DEMO_STATEMENT.currency} total). ` +
    payouts
      .map(
        (p) =>
          `${p.name} (${p.role}) receives ${p.amount.toFixed(2)} ${p.currency}`
      )
      .join("; ") +
    `. Each payout goes to the collaborator's PayPal sandbox account, and the batch returns a receipt per person.`;

  if (apiKey) {
    try {
      const res = await fetch(`${apiBase}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You explain a royalty payout plan in two short sentences. Name each collaborator, their role, and their amount. No extra commentary.",
            },
            {
              role: "user",
              content: `Instruction: ${instruction || "Pay out the royalties."} Statement: ${DEMO_STATEMENT.track} by ${DEMO_STATEMENT.artist}, ${DEMO_STATEMENT.period}, total ${DEMO_STATEMENT.totalUsd.toFixed(2)} ${DEMO_STATEMENT.currency}. Splits: ${payouts
                .map((p) => `${p.name} (${p.role}) ${p.amount.toFixed(2)} ${p.currency}`)
                .join(", ")}.`,
            },
          ],
          max_tokens: 256,
        }),
      });
      if (!res.ok) throw new Error(`Nebius request failed: ${res.status}`);
      const data = await res.json();
      const text =
        data.choices?.[0]?.message?.content?.trim() || rulesExplanation;
      explanation = text;
      explanationSource = "nebius";
    } catch {
      explanation = rulesExplanation;
      explanationSource = "rules";
    }
  } else {
    explanation = rulesExplanation;
    explanationSource = "rules";
  }

  return NextResponse.json({
    track: DEMO_STATEMENT.track,
    artist: DEMO_STATEMENT.artist,
    period: DEMO_STATEMENT.period,
    totalUsd: DEMO_STATEMENT.totalUsd,
    currency: DEMO_STATEMENT.currency,
    payouts,
    explanation,
    explanationSource,
  });
}
