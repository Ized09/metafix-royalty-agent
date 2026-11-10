export type Collaborator = {
  name: string;
  role: string;
  splitPercent: number;
  // PayPal sandbox personal account email. Replace the placeholder with the
  // real sandbox email from the PayPal developer dashboard before paying out.
  sandboxEmail: string;
};

export type RoyaltyStatement = {
  track: string;
  artist: string;
  period: string;
  totalUsd: number;
  currency: string;
  collaborators: Collaborator[];
  note: string;
};

export const DEMO_STATEMENT: RoyaltyStatement = {
  track: "Midnight in Lagos",
  artist: "Adaeze (demo artist)",
  period: "March 2026",
  totalUsd: 1240.0,
  currency: "USD",
  collaborators: [
    { name: "Adaeze", role: "Artist", splitPercent: 50, sandboxEmail: "adaeze-demo@example.com" },
    { name: "Tunde", role: "Producer", splitPercent: 30, sandboxEmail: "tunde-demo@example.com" },
    { name: "Chiamaka", role: "Songwriter", splitPercent: 20, sandboxEmail: "chiamaka-demo@example.com" },
  ],
  note: "Demo data. Fictional track, artist, and amounts.",
};

export type Payout = {
  receiver: string;
  name: string;
  role: string;
  amount: number;
  currency: string;
};

export function computePayouts(statement: RoyaltyStatement): Payout[] {
  return statement.collaborators.map((c) => ({
    receiver: c.sandboxEmail,
    name: c.name,
    role: c.role,
    amount: Math.round(statement.totalUsd * (c.splitPercent / 100) * 100) / 100,
    currency: statement.currency,
  }));
}
