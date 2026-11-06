import { dbConnect } from "@/lib/db";
import { handle, json } from "@/lib/api";
import { toCourseDTO } from "@/lib/data";
import Course from "@/models/Course";

export const GET = handle(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  await dbConnect();
  const filter: Record<string, unknown> = { published: true };
  if (category) filter.category = category;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ title: new RegExp(safe, "i") }, { shortDescription: new RegExp(safe, "i") }];
  }

  const docs = await Course.find(filter).sort({ enrolledCount: -1 }).lean();
  return json({ courses: docs.map((d) => toCourseDTO(d)) });
});
