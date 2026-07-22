import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { Mistral } from "@mistralai/mistralai";
import type { BudgetDoc, TransactionDoc, CategoryDoc } from "@/lib/models";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = new ObjectId(user.userId);
    const db = await getDb();

    const body = await req.json();
    const { question } = body;
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Context: User's budgets and total spending this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const budgets = await db.collection<BudgetDoc>("budgets").find({ userId, month: currentMonth }).toArray();
    const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await db.collection<TransactionDoc>("transactions").find({
      userId,
      occurredAt: { $gte: startOfMonth }
    }).toArray();
    
    const categories = await db.collection<CategoryDoc>("categories").find({ userId }).toArray();
    const expenseCategories = new Set(categories.filter(c => c.type === "expense").map(c => c._id.toString()));
    
    let totalSpent = 0;
    for (const t of transactions) {
      if (t.categoryId && expenseCategories.has(t.categoryId.toString())) {
        totalSpent += t.amount;
      }
    }

    const prompt = `You are a financial advisor. Answer this question: ${question}. Context: User has spent ${totalSpent} this month out of a total budget of ${totalBudget}. Return JSON: { "answer": string (a conversational 2-3 sentence response), "canAfford": boolean (true/false) }`;

    const result = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" }
    });

    const text = result.choices && result.choices[0]?.message?.content ? result.choices[0].message.content : "{}";
    const parsed = JSON.parse(text as string);

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("What-if advisor error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
