import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { SavingsGoalDoc } from "@/lib/models";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const goals = await db.collection<SavingsGoalDoc>("savingsGoals")
    .find({ userId: new ObjectId(user.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, targetAmount, targetDate } = body;
  if (!name || typeof targetAmount !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const db = await getDb();
  const doc: Omit<SavingsGoalDoc, "_id"> = {
    userId: new ObjectId(user.userId),
    name,
    targetAmount,
    currentAmount: 0,
    targetDate: targetDate ? new Date(targetDate) : null,
    createdAt: new Date(),
  };

  const result = await db.collection("savingsGoals").insertOne(doc);
  return NextResponse.json({ ...doc, _id: result.insertedId });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, amountToAdd } = body;
  if (!id || typeof amountToAdd !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const db = await getDb();
  try {
    const result = await db.collection<SavingsGoalDoc>("savingsGoals").findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(user.userId) },
      { $inc: { currentAmount: amountToAdd } },
      { returnDocument: "after" }
    );
    
    // In mongodb v6, result is the document itself if successful, or null
    // In older versions it's { value: document }
    const updatedDoc = (result && (result as any).value) ? (result as any).value : result;
    
    if (!updatedDoc) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedDoc);
  } catch (error: any) {
    console.error("Savings goals error:", error);
    return NextResponse.json({ error: error.message || "Database error" }, { status: 500 });
  }
}
