import { dbConnect } from "@/lib/db";
import { handle, json, requireAdmin } from "@/lib/api";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import User from "@/models/User";

export const GET = handle(async () => {
  await requireAdmin();
  await dbConnect();

  const [students, courses, activeEnrollments, revenueAgg, recent, topCourses] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Course.countDocuments({}),
    Enrollment.countDocuments({ status: "active" }),
    Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Enrollment.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .populate("course", "title slug")
      .lean(),
    Course.find({}).sort({ enrolledCount: -1 }).limit(5).select("title enrolledCount price").lean(),
  ]);

  return json({
    stats: {
      students,
      courses,
      activeEnrollments,
      revenue: Math.round((revenueAgg[0]?.total ?? 0) / 100),
      paidOrders: revenueAgg[0]?.count ?? 0,
    },
    recent: JSON.parse(JSON.stringify(recent)),
    topCourses: JSON.parse(JSON.stringify(topCourses)),
  });
});
