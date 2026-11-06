import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession } from "@/lib/auth";
import type { Session } from "@/lib/jwt";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new ApiError("Please log in to continue", 401);
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "admin") throw new ApiError("Admin access required", 403);
  return session;
}

/** Wraps a route handler so thrown errors become clean JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) return json({ error: err.message }, err.status);
      if (err instanceof ZodError) {
        return json({ error: err.issues[0]?.message ?? "Invalid input" }, 400);
      }
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("[api]", err);
      if (/MONGODB_URI|ECONNREFUSED|ENOTFOUND|buffering timed out|Server selection/i.test(message)) {
        return json({ error: "Database is unavailable. Check MONGODB_URI." }, 503);
      }
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError("Invalid JSON body", 400);
  }
}
