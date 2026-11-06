import { dbConnect } from "@/lib/db";
import { ApiError, handle, json } from "@/lib/api";
import { toCourseDTO } from "@/lib/data";
import Course from "@/models/Course";

export const GET = handle(async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  await dbConnect();
  const doc = await Course.findOne({ slug, published: true }).lean();
  if (!doc) throw new ApiError("Course not found", 404);
  return json({ course: toCourseDTO(doc) });
});
