"""
RazorGuard Commerce — Backend
Creates real Razorpay Test Mode orders when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
are configured. If they are not configured, /api/health reports that, and the
frontend automatically falls back to local mock data — this service never
blocks the demo either way.

Run:
    pip install -r requirements.txt
    cp .env.example .env   # then fill in your Test Mode keys
    uvicorn main:app --reload --port 8000
"""

import hmac
import hashlib
import os
import uuid
from datetime import datetime, timezone

import razorpay
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "").strip()

RAZORPAY_CONFIGURED = bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_CONFIGURED else None

app = FastAPI(title="RazorGuard Commerce API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Deterministic financial policy firewall (mirrors src/services/firewallEngine.ts)
# Kept here too so the backend can independently re-validate — the frontend
# firewall is not the only line of defense.
# ---------------------------------------------------------------------------

class PolicyConfig(BaseModel):
    min_margin_pct: float = 18
    max_discount_pct: float = 12
    max_autonomous_order_value: float = 500_000
    max_quantity_per_order: int = 500
    human_approval_threshold: float = 500_000


class EvaluateRequest(BaseModel):
    unit_cost: float
    list_price: float
    quantity: int
    requested_discount_pct: float
    policy: PolicyConfig = PolicyConfig()


@app.post("/api/firewall/evaluate")
def evaluate_proposal(req: EvaluateRequest):
    unit_price = req.list_price * (1 - req.requested_discount_pct / 100)
    order_value = unit_price * req.quantity
    margin_pct = ((unit_price - req.unit_cost) / unit_price) * 100 if unit_price else -999

    checks = {
        "MAX_DISCOUNT_PCT": req.requested_discount_pct <= req.policy.max_discount_pct,
        "MIN_MARGIN_PCT": margin_pct >= req.policy.min_margin_pct,
        "MAX_QUANTITY": req.quantity <= req.policy.max_quantity_per_order,
    }

    if not all(checks.values()):
        verdict = "BLOCKED"
        reason = "POLICY_VIOLATION"
    elif order_value > req.policy.human_approval_threshold:
        verdict = "REQUIRES_APPROVAL"
        reason = "ORDER_VALUE_EXCEEDS_AUTONOMOUS_THRESHOLD"
    else:
        verdict = "APPROVED"
        reason = "All policy checks passed."

    return {
        "verdict": verdict,
        "reason": reason,
        "unit_price": round(unit_price, 2),
        "order_value": round(order_value, 2),
        "margin_pct": round(margin_pct, 2),
        "checks": checks,
    }


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

class CreateOrderRequest(BaseModel):
    amount_inr: float = Field(..., description="Order amount in rupees (not paise)")
    receipt: str = Field(default_factory=lambda: f"rcpt_{uuid.uuid4().hex[:12]}")
    notes: dict = {}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "razorpay_configured": RAZORPAY_CONFIGURED,
        "mode": "live_test_order" if RAZORPAY_CONFIGURED else "mock",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/orders/create")
def create_order(req: CreateOrderRequest):
    if not RAZORPAY_CONFIGURED:
        raise HTTPException(
            status_code=503,
            detail="Razorpay keys not configured on the backend. Add RAZORPAY_KEY_ID / "
            "RAZORPAY_KEY_SECRET to .env and restart, or let the frontend fall back to mock mode.",
        )

    amount_paise = int(round(req.amount_inr * 100))
    order = client.order.create(
        {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": req.receipt,
            "notes": req.notes,
            "payment_capture": 1,
        }
    )
    return {
        "live": True,
        "razorpay_order_id": order["id"],
        "amount": order["amount"] / 100,
        "currency": order["currency"],
        "status": order["status"],
        "receipt": order.get("receipt"),
        "created_at": order["created_at"],
    }


# ---------------------------------------------------------------------------
# Webhook verification
# ---------------------------------------------------------------------------

@app.post("/api/webhook")
async def razorpay_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="RAZORPAY_WEBHOOK_SECRET not configured — cannot verify webhook signatures.",
        )

    expected = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    payload = await request.json()
    event = payload.get("event")
    return {"received": True, "event": event, "verified": True}
