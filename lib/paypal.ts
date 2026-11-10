const apiBase =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

export async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "PayPal sandbox credentials are not set (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)."
    );
  }
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal token request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export type PayoutItem = {
  receiver: string;
  amount: number;
  currency: string;
  senderItemId: string;
  note: string;
};

export async function getPayoutBatchStatus(batchId: string) {
  const token = await getAccessToken();
  const res = await fetch(
    `${apiBase}/v1/payments/payouts/${encodeURIComponent(batchId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `PayPal payout status failed: ${res.status} ${JSON.stringify(data)}`
    );
  }
  return data;
}

export async function createPayoutBatch(items: PayoutItem[]) {
  const token = await getAccessToken();
  const senderBatchId = `metafix-${Date.now()}`;
  const res = await fetch(`${apiBase}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: "Your MetaFix royalty payout",
      },
      items: items.map((item) => ({
        recipient_type: "EMAIL",
        amount: { value: item.amount.toFixed(2), currency: item.currency },
        receiver: item.receiver,
        note: item.note,
        sender_item_id: item.senderItemId,
      })),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal payout failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}
