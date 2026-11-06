import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireAdmin } from "@/lib/api";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import User from "@/models/User";

export const GET = handle(async () => {
  await requireAdmin();
  await dbConnect();

  const [enrollments, payments] = await Promise.all([
    Enrollment.find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("user", "name email")
      .populate("course", "title slug price")
      .populate("payment", "amount razorpayPaymentId status")
      .lean(),
    Payment.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name email")
      .populate("course", "title")
      .lean(),
  ]);

  return json({
    enrollments: JSON.parse(JSON.stringify(enrollments)),
    payments: JSON.parse(JSON.stringify(payments)),
  });
});

const grantSchema = z.object({ email: z.string().trim().toLowerCase().email(), courseId: z.string().min(1) });

/** Manually grant a student access (offline payments, scholarships, support cases). */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const { email, courseId } = grantSchema.parse(await readJson(req));
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError("Invalid course", 400);

  await dbConnect();
  const [user, course] = await Promise.all([User.findOne({ email }), Course.findById(courseId)]);
  if (!user) throw new ApiError("No student found with that email", 404);
  if (!course) throw new ApiError("Course not found", 404);

  const before = await Enrollment.findOneAndUpdate(
    { user: user._id, course: course._id },
    { $setOnInsert: { status: "active", source: "admin" } },
    { upsert: true, new: false }
  );
  if (!before) await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });
  else if (before.status !== "active") await Enrollment.updateOne({ _id: before._id }, { status: "active", source: "admin" });

  return json({ ok: true }, 201);
});
