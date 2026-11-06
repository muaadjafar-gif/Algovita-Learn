import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireSession } from "@/lib/api";
import { getRazorpay } from "@/lib/razorpay";
import { createOrderSchema } from "@/lib/validators";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";

export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const { courseId } = createOrderSchema.parse(await readJson(req));
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError("Invalid course", 400);

  await dbConnect();
  const course = await Course.findOne({ _id: courseId, published: true });
  if (!course) throw new ApiError("Course not found", 404);
  if (course.price <= 0) throw new ApiError("This course is free. Enroll directly.", 400);

  const already = await Enrollment.exists({ user: session.uid, course: course._id, status: "active" });
  if (already) throw new ApiError("You are already enrolled in this course", 409);

  const amount = Math.round(course.price * 100); // paise
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `rcpt_${Date.now().toString(36)}_${session.uid.slice(-8)}`,
    notes: { courseId: String(course._id), courseSlug: course.slug, userId: session.uid },
  });

  await Payment.create({
    user: session.uid,
    course: course._id,
    razorpayOrderId: order.id,
    amount,
    currency: "INR",
    status: "created",
  });

  return json({
    orderId: order.id,
    amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    courseTitle: course.title,
  });
});
