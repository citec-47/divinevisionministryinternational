import "server-only";

/**
 * Flutterwave, chosen because it actually operates in Cameroon: it settles in
 * XAF and accepts MTN Mobile Money and Orange Money alongside cards, which is
 * how people here really pay. Stripe cannot pay out to a Cameroonian entity at
 * all, so it was never an option.
 *
 * Only two calls are needed — create a hosted payment link, and verify a
 * transaction after the fact — so this talks to the REST API directly instead
 * of pulling in an SDK.
 */
const API_BASE = "https://api.flutterwave.com/v3";

export function isFlutterwaveConfigured(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}

function secretKey(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return key;
}

export type CreatePaymentInput = {
  reference: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customer: { email: string; name?: string; phone?: string };
  title: string;
  description: string;
  logoUrl?: string;
  /** Monthly gifts use Flutterwave payment plans; omitted for one-off gifts. */
  paymentPlanId?: string;
};

export async function createPaymentLink(input: CreatePaymentInput): Promise<string> {
  const response = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: input.reference,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      // Restricting the channels keeps the checkout honest about what works
      // here rather than showing options that will fail for a local giver.
      payment_options: "mobilemoneyfranco,card,banktransfer",
      customer: {
        email: input.customer.email,
        name: input.customer.name,
        phonenumber: input.customer.phone,
      },
      customizations: {
        title: input.title,
        description: input.description,
        ...(input.logoUrl ? { logo: input.logoUrl } : {}),
      },
      ...(input.paymentPlanId ? { payment_plan: input.paymentPlanId } : {}),
    }),
  });

  const body = (await response.json()) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  };

  if (!response.ok || body.status !== "success" || !body.data?.link) {
    throw new Error(`Flutterwave rejected the payment: ${body.message ?? response.statusText}`);
  }

  return body.data.link;
}

export type VerifiedTransaction = {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  providerRef: string;
  channel?: string;
};

/**
 * Confirms a transaction with Flutterwave directly.
 *
 * Never trust the browser's redirect parameters or a webhook body on their own
 * — both are attacker-controllable. The amount and currency are checked against
 * what we recorded before the redirect.
 */
export async function verifyTransaction(transactionId: string): Promise<VerifiedTransaction> {
  const response = await fetch(`${API_BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });

  const body = (await response.json()) as {
    status?: string;
    message?: string;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      tx_ref?: string;
      id?: number;
      payment_type?: string;
    };
  };

  if (!response.ok || body.status !== "success" || !body.data) {
    throw new Error(`Could not verify transaction: ${body.message ?? response.statusText}`);
  }

  return {
    status: String(body.data.status ?? "unknown"),
    amount: Number(body.data.amount ?? 0),
    currency: String(body.data.currency ?? ""),
    reference: String(body.data.tx_ref ?? ""),
    providerRef: String(body.data.id ?? ""),
    channel: body.data.payment_type,
  };
}
