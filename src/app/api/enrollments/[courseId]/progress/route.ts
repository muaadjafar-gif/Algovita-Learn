import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireSession } from "@/lib/api";
import { progressSchema } from "@/lib/validators";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export const POST = handle(async (req: Request, ctx: { params: Promise<{ courseId: string }> }) => {
  const session = await requireSession();
  const { courseId } = await ctx.params;
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError("Invalid course", 400);
  const { lessonId, completed } = progressSchema.parse(await readJson(req));

  await dbConnect();
  const [course, enrollment] = await Promise.all([
    Course.findById(courseId).lean(),
    Enrollment.findOne({ user: session.uid, course: courseId, status: "active" }),
  ]);
  if (!course) throw new ApiError("Course not found", 404);
  if (!enrollment) throw new ApiError("You are not enrolled in this course", 403);

  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => String(l._id)));
  if (!allLessonIds.includes(lessonId)) throw new ApiError("Lesson not found", 404);

  const done = new Set(enrollment.completedLessons);
  if (completed) done.add(lessonId);
  else done.delete(lessonId);

  // only count lessons that still exist in the course
  const valid = allLessonIds.filter((id) => done.has(id));
  enrollment.completedLessons = valid;
  enrollment.lastLessonId = lessonId;
  enrollment.progressPercent = allLessonIds.length ? Math.round((valid.length / allLessonIds.length) * 100) : 0;
  enrollment.completedAt = enrollment.progressPercent === 100 ? (enrollment.completedAt ?? new Date()) : undefined;
  await enrollment.save();

  return json({
    completedLessons: enrollment.completedLessons,
    progressPercent: enrollment.progressPercent,
  });
});
