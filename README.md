# MetaFix Royalty Payout Agent

An AI agent that pays music royalties out to the people who earned them.

MetaFix matches recordings to compositions, so it knows who is owed what. This agent takes a royalty statement, works out each collaborator's share, and pays them through **PayPal Payouts (sandbox)**, with a receipt for every payout.

Built for the **PayPal AI Hackathon** (deadline Thu Nov 12, 2026, 20:00 UTC).

## The flow

1. A royalty statement arrives for one track: total earned, period, and the collaborators with their splits.
2. The agent reads the statement and a plain-language instruction ("Pay out the March royalties for Midnight in Lagos"), matches the recording to its composition, and proposes a payout plan.
3. A human approves the plan. Nothing moves without that approval.
4. The agent executes the payouts through PayPal sandbox and returns a receipt per collaborator: batch ID, amount, status.

## Demo data

All royalty data in this repo is **fictional demo data**, clearly labelled in the app. The track, artist, collaborators, and amounts are invented to demonstrate the flow. Recipient emails are placeholders until they are replaced with the PayPal sandbox personal account emails from the developer dashboard.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in the sandbox credentials, then:
npm run dev
```

Environment variables (`.env.local`, never committed):

- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` — from a PayPal developer sandbox app at developer.paypal.com.
- `PAYPAL_API_BASE` — defaults to the sandbox API, `https://api-m.sandbox.paypal.com`.
- `NEBIUS_API_KEY` — Nebius Token Factory key for the agent's language step (same key family Baton uses). If it is not set, the agent still computes splits deterministically and labels the explanation as rules-based.
- `NEBIUS_MODEL` — defaults to `nvidia/nemotron-3-super-120b-a12b`.

## Deploy

Vercel. Set the same environment variables in the Vercel project settings. The PayPal secret stays server-side, in API routes only.

## Status

Hackathon entry, in progress. Not production. Payouts run against the PayPal sandbox only.
