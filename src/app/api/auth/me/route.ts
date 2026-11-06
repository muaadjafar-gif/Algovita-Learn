import { getSession } from "@/lib/auth";
import { handle, json } from "@/lib/api";

export const GET = handle(async () => {
  const session = await getSession();
  if (!session) return json({ user: null });
  return json({
    user: { _id: session.uid, name: session.name, email: session.email, role: session.role },
  });
});
