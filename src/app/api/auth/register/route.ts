import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import User from "@/models/User";

export const POST = handle(async (req: Request) => {
  const input = registerSchema.parse(await readJson(req));
  await dbConnect();

  const exists = await User.exists({ email: input.email });
  if (exists) throw new ApiError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone || "",
    passwordHash,
    role: "student",
  });

  await createSession({ uid: String(user._id), role: "student", name: user.name, email: user.email });
  return json({ user: { _id: String(user._id), name: user.name, email: user.email, role: "student" } }, 201);
});
