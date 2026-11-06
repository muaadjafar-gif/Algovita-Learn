import { dbConnect } from "@/lib/db";
import { fulfilPayment } from "@/lib/fulfil";
import { verifyWebhookSignature } from "@/lib/razorpay";
import Payment from "@/models/Payment";

export const runtime = "nodejs";

interface PaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  error_description?: string;
}

interface WebhookEvent {
  event: string;
  payload?: { payment?: { entity?: PaymentEntity } };
}

/**
 * Razorpay webhook: the source of truth when the customer closes the tab after paying.
 * Configure in Razorpay Dashboard > Webhooks with events payment.captured, order.paid, payment.failed.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id) return new Response("ignored", { status: 200 });

  try {
    await dbConnect();
    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
    if (!payment) return new Response("unknown order", { status: 200 });

    if (event.event === "payment.captured" || event.event === "order.paid") {
      if (entity.amount === payment.amount) {
        await fulfilPayment(entity.order_id, entity.id);
      } else {
        console.error("[webhook] amount mismatch for order", entity.order_id);
      }
    } else if (event.event === "payment.failed" && payment.status !== "paid") {
      payment.status = "failed";
      payment.failureReason = entity.error_description ?? "Payment failed";
      await payment.save();
    }
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[webhook]", err);
    // non-2xx makes Razorpay retry later
    return new Response("error", { status: 500 });
  }
}
