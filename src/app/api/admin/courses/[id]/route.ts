import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireAdmin } from "@/lib/api";
import { toCourseDTO } from "@/lib/data";
import { courseSchema } from "@/lib/validators";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

type Ctx = { params: Promise<{ id: string }> };

function checkId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError("Invalid course id", 400);
}

export const PUT = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  checkId(id);
  const input = courseSchema.parse(await readJson(req));
  await dbConnect();

  const clash = await Course.exists({ slug: input.slug, _id: { $ne: id } });
  if (clash) throw new ApiError("Another course already uses this slug", 409);

  // Strip client-supplied sub-document ids that aren't valid ObjectIds (new rows),
  // keep real ones so student progress stays attached to existing lessons.
  const modules = input.modules.map((m) => ({
    ...(m._id && mongoose.isValidObjectId(m._id) ? { _id: m._id } : {}),
    title: m.title,
    lessons: m.lessons.map((l) => ({
      ...(l._id && mongoose.isValidObjectId(l._id) ? { _id: l._id } : {}),
      title: l.title,
      durationMin: l.durationMin,
      videoUrl: l.videoUrl,
      notes: l.notes,
    })),
  }));

  const doc = await Course.findByIdAndUpdate(id, { ...input, modules }, { new: true, runValidators: true }).lean();
  if (!doc) throw new ApiError("Course not found", 404);
  return json({ course: toCourseDTO(doc, { includePrivate: true }) });
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  checkId(id);
  await dbConnect();

  const active = await Enrollment.countDocuments({ course: id, status: "active" });
  if (active > 0) {
    throw new ApiError(`${active} student(s) are enrolled. Unpublish the course instead of deleting it.`, 409);
  }
  const res = await Course.findByIdAndDelete(id);
  if (!res) throw new ApiError("Course not found", 404);
  await Enrollment.deleteMany({ course: id });
  return json({ ok: true });
});
