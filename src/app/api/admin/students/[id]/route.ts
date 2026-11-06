import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson, requireAdmin } from "@/lib/api";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({ role: z.enum(["student", "admin"]) });

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError("Invalid user id", 400);
  if (id === session.uid) throw new ApiError("You cannot change your own role", 400);
  const { role } = patchSchema.parse(await readJson(req));

  await dbConnect();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
  if (!user) throw new ApiError("User not found", 404);
  return json({ ok: true, role: user.role });
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError("Invalid user id", 400);
  if (id === session.uid) throw new ApiError("You cannot delete your own account", 400);

  await dbConnect();
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError("User not found", 404);
  await Enrollment.deleteMany({ user: id });
  return json({ ok: true });
});
