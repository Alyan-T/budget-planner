import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { CategoryDoc, BudgetDoc } from "@/lib/models";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = new ObjectId(user.userId);

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are a financial planner AI. The user is describing a life event, trip, or scenario.
Generate a realistic budget breakdown with estimated costs (in PKR) for this scenario.
Return ONLY valid JSON in the following format:
{
  "categories": [
    { "name": "Category Name", "limitAmount": 1000 }
  ]
}
For example, if the prompt is "Trip to Lahore for 2 weeks", categories might include "Flights", "Accommodation", "Food", "Activities".
Provide realistic PKR estimates for Pakistan.`;

    const result = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User scenario: ${prompt}` }
      ],
      responseFormat: { type: "json_object" }
    });

    const text = result.choices && result.choices[0]?.message?.content ? result.choices[0].message.content : "{}";

    // Parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch (e) {
      console.error("AI JSON parse error:", e, text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (!parsed || !Array.isArray(parsed.categories)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const db = await getDb();
    const generatedBudgets = [];

    // Process each category
    for (const item of parsed.categories) {
      const cleanName = String(item.name).trim();
      const limitAmount = Number(item.limitAmount);
      
      if (!cleanName || isNaN(limitAmount) || limitAmount <= 0) continue;
      generatedBudgets.push({ name: cleanName, limitAmount });
    }

    if (generatedBudgets.length > 0) {
      await db.collection("generated_plans").insertOne({
        userId,
        title: prompt, // use the prompt as the title
        categories: generatedBudgets,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, budgets: generatedBudgets });
  } catch (error: any) {
    console.error("Failed to generate budget:", error);
    const message = error?.message || error?.toString() || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
