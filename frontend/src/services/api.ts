/**
 * Talks to the RazorGuard FastAPI backend (see /backend in the project root).
 * If the backend is unreachable, or Razorpay keys aren't configured there,
 * every function here fails softly — callers fall back to razorpayMock.ts.
 * The UI never breaks because a backend/keys aren't set up; it just runs in
 * mock mode and says so.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export interface HealthStatus {
  reachable: boolean;
  razorpayConfigured: boolean;
}

export async function checkBackendHealth(timeoutMs = 1500): Promise<HealthStatus> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return { reachable: false, razorpayConfigured: false };
    const data = await res.json();
    return { reachable: true, razorpayConfigured: Boolean(data.razorpay_configured) };
  } catch {
    return { reachable: false, razorpayConfigured: false };
  }
}

export interface LiveOrderResult {
  razorpayOrderId: string;
  amount: number;
  status: string;
}

/** Attempts to create a REAL Razorpay test-mode order via the backend. Throws on any failure. */
export async function createLiveOrder(params: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<LiveOrderResult> {
  const res = await fetch(`${API_BASE}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount_inr: params.amountInr,
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Backend order creation failed (${res.status})`);
  }
  const data = await res.json();
  return {
    razorpayOrderId: data.razorpay_order_id,
    amount: data.amount,
    status: data.status,
  };
}
