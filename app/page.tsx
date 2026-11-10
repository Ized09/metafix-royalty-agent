"use client";

import { useState } from "react";

type Payout = {
  receiver: string;
  name: string;
  role: string;
  amount: number;
  currency: string;
};

type Plan = {
  track: string;
  artist: string;
  period: string;
  totalUsd: number;
  currency: string;
  payouts: Payout[];
  explanation: string;
  explanationSource: "nebius" | "rules";
};

type Receipt = {
  batchId: string | null;
  status: string | null;
  items: {
    payoutItemId: string | null;
    receiver: string | null;
    amount: string | null;
    status: string | null;
  }[];
};

const STATEMENT = {
  track: "Midnight in Lagos",
  artist: "Adaeze (demo artist)",
  period: "March 2026",
  totalUsd: 1240.0,
  currency: "USD",
  collaborators: [
    { name: "Adaeze", role: "Artist", split: 50 },
    { name: "Tunde", role: "Producer", split: 30 },
    { name: "Chiamaka", role: "Songwriter", split: 20 },
  ],
};

export default function Page() {
  const [instruction, setInstruction] = useState(
    "Pay out the March royalties for Midnight in Lagos."
  );
  const [plan, setPlan] = useState<Plan | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setBusy(true);
    setError(null);
    setReceipt(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Plan failed.");
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Plan failed.");
    } finally {
      setBusy(false);
    }
  }

  async function payOut() {
    if (!plan) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payouts: plan.payouts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payout failed.");
      setReceipt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
        MetaFix · Demo data
      </p>
      <h1 style={{ fontSize: 32, margin: "8px 0" }}>
        Royalty Payout Agent
      </h1>
      <p style={{ color: "#444" }}>
        MetaFix matches the recording to its composition and works out who is
        owed what. The agent pays each collaborator through PayPal sandbox
        Payouts, with a receipt per person. Nothing moves until you approve
        the plan.
      </p>

      <section
        style={{
          border: "1px solid #ddd",
          padding: 16,
          marginTop: 24,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Royalty statement</h2>
        <p>
          <strong>{STATEMENT.track}</strong> · {STATEMENT.artist}
          <br />
          Period: {STATEMENT.period} · Total:{" "}
          {STATEMENT.totalUsd.toFixed(2)} {STATEMENT.currency}
        </p>
        <ul>
          {STATEMENT.collaborators.map((c) => (
            <li key={c.name}>
              {c.name} ({c.role}) — {c.split}%
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 12, color: "#666" }}>
          Demo data. Fictional track, artist, and amounts.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <label htmlFor="instruction" style={{ fontWeight: 600 }}>
          Tell the agent what to pay out
        </label>
        <input
          id="instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 8,
            padding: 10,
            fontSize: 15,
          }}
        />
        <button
          onClick={generatePlan}
          disabled={busy}
          style={{
            marginTop: 12,
            padding: "10px 18px",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {busy ? "Working…" : "Generate payout plan"}
        </button>
      </section>

      {plan && (
        <section
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginTop: 24,
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Payout plan</h2>
          <p>{plan.explanation}</p>
          <p style={{ fontSize: 12, color: "#666" }}>
            Explanation by:{" "}
            {plan.explanationSource === "nebius"
              ? "Nebius model"
              : "rules (no model key set)"}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th style={{ textAlign: "left" }}>Role</th>
                <th style={{ textAlign: "left" }}>PayPal sandbox email</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {plan.payouts.map((p) => (
                <tr key={p.receiver}>
                  <td>{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.receiver}</td>
                  <td style={{ textAlign: "right" }}>
                    {p.amount.toFixed(2)} {p.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={payOut}
            disabled={busy || !!receipt}
            style={{
              marginTop: 16,
              padding: "10px 18px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {receipt ? "Paid" : busy ? "Paying…" : "Approve and pay out"}
          </button>
        </section>
      )}

      {receipt && (
        <section
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginTop: 24,
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Receipts</h2>
          <p>
            Batch ID: <code>{receipt.batchId ?? "—"}</code>
            <br />
            Batch status: {receipt.status ?? "—"}
          </p>
          <ul>
            {receipt.items.map((item, i) => (
              <li key={item.payoutItemId ?? i}>
                {item.receiver} — {item.amount} — {item.status}
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && (
        <p style={{ color: "#b00020", marginTop: 24 }}>Error: {error}</p>
      )}
    </main>
  );
}
