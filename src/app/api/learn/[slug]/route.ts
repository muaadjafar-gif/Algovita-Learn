import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, requireSession } from "@/lib/api";
import { toCourseDTO } from "@/lib/data";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

/** Full course content (including video URLs). Only for enrolled students and admins. */
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await requireSession();
  const { slug } = await ctx.params;
  await dbConnect();

  const course = await Course.findOne({ slug }).lean();
  if (!course) throw new ApiError("Course not found", 404);

  const enrollment = await Enrollment.findOne({ user: session.uid, course: course._id, status: "active" }).lean();
  if (!enrollment && session.role !== "admin") {
    throw new ApiError("Enroll in this course to access the lessons", 403);
  }

  return json({
    course: toCourseDTO(course, { includePrivate: true }),
    progress: {
      completedLessons: enrollment?.completedLessons ?? [],
      progressPercent: enrollment?.progressPercent ?? 0,
      lastLessonId: enrollment?.lastLessonId ?? "",
      preview: !enrollment,
    },
  });
});
