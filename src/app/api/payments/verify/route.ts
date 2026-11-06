import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireSession } from "@/lib/api";
import { fulfilPayment } from "@/lib/fulfil";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validators";
import Course from "@/models/Course";
import Payment from "@/models/Payment";

export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const body = verifyPaymentSchema.parse(await readJson(req));

  await dbConnect();
  const payment = await Payment.findOne({ razorpayOrderId: body.razorpay_order_id, user: session.uid });
  if (!payment) throw new ApiError("Order not found", 404);

  const valid = verifyCheckoutSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
  if (!valid) {
    if (payment.status !== "paid") {
      payment.status = "failed";
      payment.failureReason = "Signature verification failed";
      await payment.save();
    }
    throw new ApiError("Payment verification failed. If money was deducted, contact support.", 400);
  }

  await fulfilPayment(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
  const course = await Course.findById(payment.course).select("slug title").lean();

  return json({ ok: true, courseSlug: course?.slug ?? null, courseTitle: course?.title ?? null });
});
