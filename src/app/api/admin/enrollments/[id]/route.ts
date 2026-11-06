import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireAdmin } from "@/lib/api";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({ status: z.enum(["active", "revoked"]) });

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError("Invalid enrollment id", 400);
  const { status } = patchSchema.parse(await readJson(req));

  await dbConnect();
  const enrollment = await Enrollment.findById(id);
  if (!enrollment) throw new ApiError("Enrollment not found", 404);
  if (enrollment.status === status) return json({ ok: true, status });

  enrollment.status = status;
  await enrollment.save();
  await Course.updateOne(
    { _id: enrollment.course, enrolledCount: status === "revoked" ? { $gt: 0 } : { $gte: 0 } },
    { $inc: { enrolledCount: status === "revoked" ? -1 : 1 } }
  );
  return json({ ok: true, status });
});
