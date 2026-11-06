import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";

/**
 * Marks a Razorpay order as paid and activates the enrollment.
 * Idempotent: safe to call from both the browser verify step and the webhook.
 * Returns false when the order is unknown.
 */
export async function fulfilPayment(orderId: string, paymentId: string, signature = ""): Promise<boolean> {
  await dbConnect();
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment) return false;

  if (payment.status !== "paid") {
    payment.status = "paid";
    payment.razorpayPaymentId = paymentId;
    if (signature) payment.razorpaySignature = signature;
    payment.paidAt = new Date();
    payment.failureReason = "";
    await payment.save();
  }

  try {
    const before = await Enrollment.findOneAndUpdate(
      { user: payment.user, course: payment.course },
      { $setOnInsert: { status: "active", source: "razorpay", payment: payment._id } },
      { upsert: true, new: false }
    );
    if (!before) {
      await Course.updateOne({ _id: payment.course }, { $inc: { enrolledCount: 1 } });
    } else if (before.status !== "active") {
      await Enrollment.updateOne(
        { _id: before._id },
        { status: "active", source: "razorpay", payment: payment._id }
      );
    }
  } catch (err) {
    // Duplicate key from a concurrent verify + webhook race means the enrollment already exists.
    if ((err as { code?: number }).code !== 11000) throw err;
  }
  return true;
}
