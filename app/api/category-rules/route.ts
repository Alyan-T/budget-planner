import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { CategoryRuleDoc, CategoryDoc } from "@/lib/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = new ObjectId(user.userId);
  const db = await getDb();

  const rules = await db.collection<CategoryRuleDoc>("category_rules").find({ userId }).toArray();
  const allCategories = await db.collection<CategoryDoc>("categories").find({ userId }).toArray();
  
  const categoryMap = new Map(allCategories.map(c => [c._id.toString(), c.name]));

  const rulesWithCategory = rules.map(r => ({
    ...r,
    targetCategoryName: categoryMap.get(r.targetCategoryId.toString()) || "Unknown",
  }));

  return NextResponse.json({ 
    rules: rulesWithCategory,
    categories: allCategories.map(c => ({ id: c._id.toString(), name: c.name }))
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = new ObjectId(user.userId);
  const body = await req.json();
  const { keyword, matchType, targetCategoryId } = body;

  if (!keyword || !matchType || !targetCategoryId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  const catId = new ObjectId(targetCategoryId);

  const category = await db.collection<CategoryDoc>("categories").findOne({ _id: catId, userId });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const newRule: Omit<CategoryRuleDoc, "_id"> = {
    userId,
    keyword,
    matchType,
    targetCategoryId: catId,
    createdAt: new Date(),
  };

  const result = await db.collection("category_rules").insertOne(newRule);
  return NextResponse.json({ ruleId: result.insertedId });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = new ObjectId(user.userId);
  const body = await req.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await getDb();
  await db.collection("category_rules").deleteOne({ _id: new ObjectId(id), userId });

  return NextResponse.json({ success: true });
}
