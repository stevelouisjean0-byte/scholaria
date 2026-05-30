/**
 * Purchase credit tracking — one Stripe one-time payment = one upload credit.
 *
 * On Stripe success the user is redirected to /upload?session_id=cs_xxx.
 * The upload page calls verifyPurchaseSession() which:
 *   1. Hits Stripe to confirm the session is paid + product matches
 *   2. Inserts a row into the purchases table (idempotent on session_id)
 *   3. Returns the unconsumed credit
 *
 * On successful upload, /api/upload calls consumePurchase() which marks
 * the credit consumed and links it to the new job_id.
 *
 * Table is auto-created on first use.
 */
import { db } from "./db";
import { stripe } from "./stripe";
import { getProduct, type Product } from "./products";

export interface PurchaseRecord {
  id: number;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  product_slug: string;
  product_name: string | null;
  email: string;
  amount_cents: number;
  word_cap: number | null;
  created_at: Date;
  consumed_at: Date | null;
  consumed_job_id: string | null;
}

let tableReady = false;
async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await db.query(`
    create table if not exists purchases (
      id bigserial primary key,
      stripe_session_id text unique not null,
      stripe_payment_intent text,
      product_slug text not null,
      product_name text,
      email text not null,
      amount_cents int not null,
      word_cap int,
      created_at timestamptz not null default now(),
      consumed_at timestamptz,
      consumed_job_id text
    )
  `);
  await db.query(`create index if not exists purchases_email_idx on purchases(lower(email))`);
  await db.query(`create index if not exists purchases_unconsumed_idx on purchases(email) where consumed_at is null`);
  tableReady = true;
}

export interface VerifyResult {
  ok: boolean;
  purchase?: PurchaseRecord;
  product?: Product;
  reason?: string;
}

/**
 * Confirms the Stripe session is paid and idempotently records the purchase.
 * Returns the credit row whether or not it has been consumed (the caller
 * decides what to do with consumed credits — typically show "already used").
 */
export async function verifyPurchaseSession(sessionId: string): Promise<VerifyResult> {
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return { ok: false, reason: "Invalid session id." };
  }

  await ensureTable();

  // Fast path: do we already have this session on file?
  try {
    const { rows } = await db.query("select * from purchases where stripe_session_id = $1 limit 1", [sessionId]);
    if (rows[0]) {
      const purchase = rows[0] as PurchaseRecord;
      const product = getProduct(purchase.product_slug) ?? undefined;
      return { ok: true, purchase, product };
    }
  } catch (err) {
    console.warn("[purchases] db lookup failed:", err);
  }

  // Slow path: hit Stripe.
  let session: any;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"]
    });
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Stripe lookup failed" };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, reason: `Payment status is "${session.payment_status}", not "paid".` };
  }

  const productSlug = (session.metadata?.product_slug as string | undefined) ?? "";
  const product = getProduct(productSlug);
  if (!product) {
    return { ok: false, reason: "Product not recognised on this session." };
  }

  const email = (session.customer_email as string | null) ?? (session.customer_details?.email as string | null) ?? "";
  if (!email) {
    return { ok: false, reason: "No email on Stripe session." };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  try {
    const { rows } = await db.query(
      `insert into purchases
         (stripe_session_id, stripe_payment_intent, product_slug, product_name, email, amount_cents, word_cap)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (stripe_session_id) do nothing
       returning *`,
      [
        sessionId,
        paymentIntentId,
        product.slug,
        product.name,
        email.toLowerCase(),
        product.priceCents,
        product.wordCap
      ]
    );
    const purchase = (rows[0] as PurchaseRecord) ?? null;
    if (purchase) return { ok: true, purchase, product };
    // Race: another request inserted first. Re-read.
    const { rows: re } = await db.query("select * from purchases where stripe_session_id = $1 limit 1", [sessionId]);
    return { ok: true, purchase: re[0] as PurchaseRecord, product };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Database write failed." };
  }
}

/**
 * Mark a purchase consumed and link it to the job_id created from the upload.
 * Idempotent — if the purchase is already consumed, returns false (caller
 * should reject the upload because the credit was already spent).
 */
export async function consumePurchase(sessionId: string, jobId: string): Promise<boolean> {
  try {
    await ensureTable();
    const { rowCount } = await db.query(
      `update purchases
          set consumed_at = now(), consumed_job_id = $2
        where stripe_session_id = $1
          and consumed_at is null`,
      [sessionId, jobId]
    );
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.warn("[purchases] consume failed:", err);
    return false;
  }
}

/**
 * List recent purchases (admin view).
 */
export async function listPurchases(limit = 100): Promise<PurchaseRecord[]> {
  try {
    await ensureTable();
    const { rows } = await db.query(
      "select * from purchases order by created_at desc limit $1",
      [limit]
    );
    return rows as PurchaseRecord[];
  } catch {
    return [];
  }
}
