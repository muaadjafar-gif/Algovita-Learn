import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { ApiError, handle, json, readJson } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import User from "@/models/User";

// Lazily-built dummy hash so response time doesn't reveal whether an email exists.
let dummyHash: string | null = null;
async function getDummyHash(): Promise<string> {
  const hash: string = dummyHash ?? (await bcrypt.hash("not-a-real-password", 12));
  dummyHash = hash;
  return hash;
}

export const POST = handle(async (req: Request) => {
  const input = loginSchema.parse(await readJson(req));
  await dbConnect();

  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !ok) throw new ApiError("Incorrect email or password", 401);

  await createSession({ uid: String(user._id), role: user.role, name: user.name, email: user.email });
  return json({ user: { _id: String(user._id), name: user.name, email: user.email, role: user.role } });
});
