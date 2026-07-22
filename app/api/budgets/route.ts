import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { CategoryDoc, BudgetDoc } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = new ObjectId(user.userId);

    const body = await req.json();
    const { categoryName, limitAmount } = body;

    if (!categoryName || typeof categoryName !== "string" || !categoryName.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    if (typeof limitAmount !== "number" || limitAmount <= 0) {
      return NextResponse.json({ error: "Valid limit amount is required" }, { status: 400 });
    }

    const db = await getDb();
    const cleanName = categoryName.trim();

    // 1. Find or create the category
    let category = await db.collection<CategoryDoc>("categories").findOne({
      userId,
      name: { $regex: new RegExp(`^${cleanName}$`, "i") },
    });

    if (!category) {
      const res = await db.collection<Omit<CategoryDoc, "_id">>("categories").insertOne({
        userId,
        name: cleanName,
        type: "expense", // budgets usually apply to expenses
      });
      category = { _id: res.insertedId, userId, name: cleanName, type: "expense" } as CategoryDoc;
    }

    // 2. Upsert the budget for the current month
    const month = new Date();
    month.setDate(1);
    month.setHours(0, 0, 0, 0);

    await db.collection<BudgetDoc>("budgets").updateOne(
      { userId, categoryId: category._id, month },
      {
        $set: {
          limitAmount: limitAmount,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to set budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
