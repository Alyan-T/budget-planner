import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/lib/models";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const { insertedId } = await users.insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  });

  // Seed default categories so the transaction parser has something to match against.
  const categories = db.collection("categories");
  await categories.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: insertedId }))
  );

  const token = await signSession({ userId: insertedId.toString(), email: normalizedEmail });

  const res = NextResponse.json({ email: normalizedEmail });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
