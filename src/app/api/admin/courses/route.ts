import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireAdmin } from "@/lib/api";
import { toCourseDTO } from "@/lib/data";
import { courseSchema } from "@/lib/validators";
import Course from "@/models/Course";

export const GET = handle(async () => {
  await requireAdmin();
  await dbConnect();
  const docs = await Course.find({}).sort({ createdAt: -1 }).lean();
  return json({ courses: docs.map((d) => toCourseDTO(d, { includePrivate: true })) });
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const input = courseSchema.parse(await readJson(req));
  await dbConnect();

  const taken = await Course.exists({ slug: input.slug });
  if (taken) throw new ApiError("A course with this slug already exists", 409);

  const doc = await Course.create(input);
  return json({ course: toCourseDTO(doc.toObject(), { includePrivate: true }) }, 201);
});
