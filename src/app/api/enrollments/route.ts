import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireSession } from "@/lib/api";
import { toCourseDTO } from "@/lib/data";
import { createOrderSchema } from "@/lib/validators";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

/** My enrollments with course summaries and progress. */
export const GET = handle(async () => {
  const session = await requireSession();
  await dbConnect();

  const docs = await Enrollment.find({ user: session.uid, status: "active" })
    .sort({ updatedAt: -1 })
    .populate("course")
    .lean();

  const enrollments = docs
    .filter((e) => e.course && typeof e.course === "object" && "title" in (e.course as object))
    .map((e) => {
      const plain = JSON.parse(JSON.stringify(e));
      return { ...plain, course: toCourseDTO(e.course) };
    });

  return json({ enrollments });
});

/** Free course enrollment. Paid courses must go through /api/payments. */
export const POST = handle(async (req: Request) => {
  const session = await requireSession();
  const { courseId } = createOrderSchema.parse(await readJson(req));
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError("Invalid course", 400);

  await dbConnect();
  const course = await Course.findOne({ _id: courseId, published: true });
  if (!course) throw new ApiError("Course not found", 404);
  if (course.price > 0) throw new ApiError("This course requires payment", 402);

  const existing = await Enrollment.findOne({ user: session.uid, course: course._id });
  if (existing?.status === "active") return json({ enrollmentId: String(existing._id), already: true });

  if (existing) {
    existing.status = "active";
    existing.source = "free";
    await existing.save();
    return json({ enrollmentId: String(existing._id) });
  }

  const enrollment = await Enrollment.create({ user: session.uid, course: course._id, source: "free" });
  await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });
  return json({ enrollmentId: String(enrollment._id) }, 201);
});
