import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { RecurringBillDoc, CategoryDoc } from "@/lib/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const userId = new ObjectId(user.userId);

  const bills = await db
    .collection<RecurringBillDoc>("recurringBills")
    .find({ userId, isActive: true })
    .sort({ nextDueDate: 1 })
    .toArray();

  const categoryIds = Array.from(
    new Set(bills.map((b) => b.categoryId?.toString()).filter(Boolean))
  ).map((id) => new ObjectId(id as string));

  const categories = await db
    .collection<CategoryDoc>("categories")
    .find({ _id: { $in: categoryIds } })
    .toArray();

  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));

  const result = bills.map((b) => ({
    ...b,
    categoryName: b.categoryId ? categoryMap.get(b.categoryId.toString()) || null : null,
  }));

  return NextResponse.json({ bills: result });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, amount, frequency, nextDueDate, categoryId } = body;

  if (!name || typeof amount !== "number" || !frequency || !nextDueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await getDb();
  
  const newBill: Omit<RecurringBillDoc, "_id"> = {
    userId: new ObjectId(user.userId),
    name,
    amount,
    frequency,
    nextDueDate: new Date(nextDueDate),
    categoryId: categoryId ? new ObjectId(categoryId) : null,
    isActive: true,
    createdAt: new Date(),
  };

  const res = await db.collection("recurringBills").insertOne(newBill);
  
  return NextResponse.json({ success: true, id: res.insertedId });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await getDb();
  await db.collection("recurringBills").updateOne(
    { _id: new ObjectId(id), userId: new ObjectId(user.userId) },
    { $set: { isActive: false } }
  );

  return NextResponse.json({ success: true });
}
