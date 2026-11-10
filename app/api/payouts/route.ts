import { NextResponse } from "next/server";
import { createPayoutBatch, getPayoutBatchStatus } from "@/lib/paypal";

type PayPalPayoutItemResponse = {
  payout_item_id?: unknown;
  payout_item?: { receiver?: unknown; amount?: { value?: unknown } };
  transaction_status?: unknown;
};

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function GET(req: Request) {
  const batchId = new URL(req.url).searchParams.get("batchId");
  if (!batchId) {
    return NextResponse.json({ error: "batchId is required." }, { status: 400 });
  }
  try {
    const result = await getPayoutBatchStatus(batchId);
    return NextResponse.json({
      batchId: result.batch_header?.payout_batch_id ?? batchId,
      status: result.batch_header?.batch_status ?? null,
      items: ((result.items ?? []) as PayPalPayoutItemResponse[]).map(
        (item) => ({
          payoutItemId: asString(item.payout_item_id),
          receiver: asString(item.payout_item?.receiver),
          amount: asString(item.payout_item?.amount?.value),
          status: asString(item.transaction_status),
        })
      ),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payout status failed." },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const payouts = body.payouts as
    | { receiver: string; name: string; amount: number; currency: string }[]
    | undefined;
  if (!Array.isArray(payouts) || payouts.length === 0) {
    return NextResponse.json(
      { error: "No payouts supplied." },
      { status: 400 }
    );
  }
  try {
    const result = await createPayoutBatch(
      payouts.map((p, i) => ({
        receiver: p.receiver,
        amount: p.amount,
        currency: p.currency || "USD",
        senderItemId: `item-${i + 1}`,
        note: `Royalty payout for ${p.name}`,
      }))
    );
    return NextResponse.json({
      batchId: result.batch_header?.payout_batch_id ?? null,
      status: result.batch_header?.batch_status ?? null,
      items: ((result.items ?? []) as PayPalPayoutItemResponse[]).map(
        (item) => ({
          payoutItemId: asString(item.payout_item_id),
          receiver: asString(item.payout_item?.receiver),
          amount: asString(item.payout_item?.amount?.value),
          status: asString(item.transaction_status),
        })
      ),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payout failed." },
      { status: 502 }
    );
  }
}
