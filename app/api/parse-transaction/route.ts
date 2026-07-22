import { Mistral } from "@mistralai/mistralai";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { CategoryDoc, CategoryRuleDoc } from "@/lib/models";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || "" });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { input } = await req.json();
  const userId = new ObjectId(user.userId);
  const db = await getDb();

  const categories = await db
    .collection<CategoryDoc>("categories")
    .find({ userId })
    .toArray();

  const rules = await db.collection<CategoryRuleDoc>("category_rules").find({ userId }).toArray();
  
  let ruleMatch = null;
  for (const rule of rules) {
    const lowerInput = input.toLowerCase();
    const lowerKeyword = rule.keyword.toLowerCase();
    
    if (rule.matchType === "contains" && lowerInput.includes(lowerKeyword)) {
      ruleMatch = rule;
      break;
    }
    if (rule.matchType === "startsWith" && lowerInput.startsWith(lowerKeyword)) {
      ruleMatch = rule;
      break;
    }
    if (rule.matchType === "exact" && lowerInput === lowerKeyword) {
      ruleMatch = rule;
      break;
    }
  }
  
  if (ruleMatch) {
    const amountMatch = input.match(/(?:Rs\.?|PKR|\$)?\s?(\d+(?:\.\d+)?)/i);
    if (!amountMatch) {
      return NextResponse.json({ error: "Could not parse amount from input" }, { status: 422 });
    }
    const amount = parseFloat(amountMatch[1]);
    const doc = {
      userId,
      categoryId: ruleMatch.targetCategoryId,
      amount,
      description: input,
      rawInput: input,
      aiConfidence: 1.0,
      occurredAt: new Date(),
      createdAt: new Date(),
    };
    const { insertedId } = await db.collection("transactions").insertOne(doc);
    return NextResponse.json({ id: insertedId.toString(), ...doc });
  }

  const categoriesForPrompt = categories.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    type: c.type,
  }));

  const prompt = `Parse this financial transaction into structured JSON.
Input: "${input}"
Available categories: ${JSON.stringify(categoriesForPrompt)}
Return exactly: {"amount": number, "description": string, "category_id": string|null, "type": "income"|"expense", "confidence": number between 0 and 1}
Rules: amount is always positive. If no category fits well, set category_id to null. category_id, if set, must be one of the "id" values above. Infer type from context (e.g. "got paid" = income, "spent" = expense).`;

  let parsed;
  try {
    const result = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" }
    });
    
    const text = result.choices && result.choices[0]?.message?.content ? result.choices[0].message.content : "{}";
    parsed = JSON.parse(text as string);
  } catch (error) {
    console.warn("AI parsing failed (likely quota/API key issue). Falling back to regex.", error);
    // Simple regex fallback: looks for Rs. or PKR or $ followed by numbers
    const amountMatch = input.match(/(?:Rs\.?|PKR|\$)?\s?(\d+(?:\.\d+)?)/i);
    if (!amountMatch) {
      return NextResponse.json({ error: "Could not parse input" }, { status: 422 });
    }
    const amount = parseFloat(amountMatch[1]);
    const isIncome = input.toLowerCase().includes("got paid") || input.toLowerCase().includes("salary") || input.toLowerCase().includes("income");
    
    parsed = {
      amount,
      description: input,
      category_id: null,
      type: isIncome ? "income" : "expense",
      confidence: 0.5
    };
  }

  if (typeof parsed.amount !== "number" || parsed.amount <= 0) {
    return NextResponse.json({ error: "Could not extract an amount" }, { status: 422 });
  }

  let categoryId: ObjectId | null = null;
  if (parsed.category_id && ObjectId.isValid(parsed.category_id)) {
    // only trust it if it's actually one of this user's categories
    const match = categories.find((c) => c._id.toString() === parsed.category_id);
    if (match) categoryId = match._id;
  }
  
  // Fallback: If no category was assigned but we know the type, assign a default category of that type
  if (!categoryId && parsed.type) {
    const defaultMatch = categories.find((c) => c.type === parsed.type);
    if (defaultMatch) categoryId = defaultMatch._id;
  }

  const doc = {
    userId,
    categoryId,
    amount: parsed.amount,
    description: parsed.description ?? null,
    rawInput: input,
    aiConfidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
    occurredAt: new Date(),
    createdAt: new Date(),
  };

  const { insertedId } = await db.collection("transactions").insertOne(doc);
  return NextResponse.json({ id: insertedId.toString(), ...doc });
}
