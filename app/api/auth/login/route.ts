import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import type { UserDoc } from "@/lib/models";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ email: normalizedEmail });

  // Same error for "no such user" and "wrong password" — don't leak which one it was.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signSession({ userId: user._id.toString(), email: user.email });

  const res = NextResponse.json({ email: user.email });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
