import { SignJWT, jwtVerify } from "jose";

export type Role = "student" | "admin";

export interface Session {
  uid: string;
  role: Role;
  name: string;
  email: string;
}

export const SESSION_COOKIE = "algovita_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (min 16 characters). Set it in .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (!payload.uid || !payload.role) return null;
    return {
      uid: String(payload.uid),
      role: payload.role === "admin" ? "admin" : "student",
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}
