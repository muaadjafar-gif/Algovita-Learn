import { dbConnect } from "@/lib/db";
import { handle, json, requireAdmin } from "@/lib/api";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";

export const GET = handle(async () => {
  await requireAdmin();
  await dbConnect();

  const [users, counts] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).limit(500).lean(),
    Enrollment.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$user", count: { $sum: 1 }, avg: { $avg: "$progressPercent" } } },
    ]),
  ]);

  const byUser = new Map<string, { count: number; avg: number }>(
    counts.map((c) => [String(c._id), { count: c.count, avg: Math.round(c.avg ?? 0) }])
  );

  const students = users.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role,
    createdAt: u.createdAt,
    enrollments: byUser.get(String(u._id))?.count ?? 0,
    avgProgress: byUser.get(String(u._id))?.avg ?? 0,
  }));

  return json({ students });
});
