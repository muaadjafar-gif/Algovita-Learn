/**
 * Seeds the database with the course catalog and creates the first admin.
 * Usage: npm run seed   (reads .env.local)
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Course from "../src/models/Course";
import { seedCourses } from "../src/lib/seed-data";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  let created = 0;
  for (const course of seedCourses) {
    const existing = await Course.findOne({ slug: course.slug });
    if (existing) continue;
    await Course.create(course);
    created++;
  }
  console.log(`Courses: ${created} created, ${seedCourses.length - created} already present`);

  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || password.length < 8) {
    console.log("Skipped admin: set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env.local");
  } else {
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log(`Promoted ${email} to admin`);
      } else {
        console.log(`Admin ${email} already exists`);
      }
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      await User.create({ name, email, passwordHash, role: "admin" });
      console.log(`Admin created: ${email}`);
    }
  }

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
