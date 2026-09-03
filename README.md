# RazorGuard Commerce — Fullstack

**"Let AI negotiate. Never let AI control the money."**

Built for Razorpay AI Buildathon 2026 — Track 01: Agentic Commerce.

This package has two parts:

```
razorguard-commerce-fullstack/
  frontend/   React + Vite + TypeScript SPA (the whole UI)
  backend/    FastAPI service that creates real Razorpay Test Mode orders
```

The frontend runs perfectly well **on its own**, using local mock data for
catalog, negotiations, and orders. The backend is optional but recommended:
when it's running and has real Razorpay Test Mode keys configured, the
frontend automatically creates a genuine Razorpay test order (with a real
order ID) instead of a fabricated one — no code changes needed, it detects
this at runtime via `/api/health`.

## Fastest path: frontend only (mock mode)

```bash
cd frontend
npm install
npm run dev
```

Open the printed localhost URL. The top bar will show **Gateway: MOCK ONLY**.

## Full setup: frontend + live Razorpay backend

**1. Start the backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and fill in your Razorpay **Test Mode** credentials (Dashboard →
Settings → API Keys → Generate Test Key):

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

Then run it:

```bash
uvicorn main:app --reload --port 8000
```

Confirm it picked up your keys:

```bash
curl http://localhost:8000/api/health
# {"status":"ok","razorpay_configured":true,"mode":"live_test_order",...}
```

**2. Start the frontend**

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env    # optional, defaults already point at localhost:8000
npm run dev
```

Open the app. The top bar now shows **Gateway: LIVE TEST ORDERS**. Any
proposal that clears the firewall autonomously (Live Negotiations, or the
Attack & Scenario Simulator's "Legitimate Bulk Negotiation" scenario) will
create a real order in your Razorpay Test Mode dashboard — check
Dashboard → Orders to see it appear with a genuine `order_...` ID.

## What happens if the backend isn't running, or has no keys

Nothing breaks. `checkBackendHealth()` in `frontend/src/services/api.ts`
times out after 1.5s and reports `reachable: false`; the store then falls
back to `frontend/src/services/razorpayMock.ts` for that order, tagging it
`live: false` (shown as a `MOCK` badge in the Transactions table). Every
other part of the demo — the firewall, the prompt-injection block, the
audit trail — works identically either way, since none of that logic
depends on Razorpay at all.

## Notes for judges / reviewers

- The **Financial Policy Firewall** is deterministic pure arithmetic
  (`frontend/src/services/firewallEngine.ts`, mirrored in
  `backend/main.py`'s `/api/firewall/evaluate` for independent
  verification). Neither implementation reads the AI buyer's message
  content — only structured numeric fields (quantity, discount %, price).
- `backend/main.py` also exposes `/api/webhook`, which verifies a Razorpay
  webhook's `X-Razorpay-Signature` using HMAC-SHA256 against
  `RAZORPAY_WEBHOOK_SECRET`, for a genuine end-to-end payment confirmation
  if you wire up a real webhook in the Razorpay dashboard pointing at this
  endpoint (e.g. via ngrok during a live demo).
