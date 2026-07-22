import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  const { input } = await req.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Parse this financial transaction into structured JSON.
Input: "${input}"
Available categories: ${JSON.stringify(categories)}
Return exactly: {"amount": number, "description": string, "category_id": string|null, "type": "income"|"expense", "confidence": number between 0 and 1}
Rules: amount is always positive. If no category fits well, set category_id to null. Infer type from context (e.g. "got paid" = income, "spent" = expense).`;

  let parsed;
  try {
    const result = await model.generateContent(prompt);
    parsed = JSON.parse(result.response.text());
  } catch {
    return NextResponse.json({ error: "Could not parse input" }, { status: 422 });
  }

  if (typeof parsed.amount !== "number" || parsed.amount <= 0) {
    return NextResponse.json({ error: "Could not extract an amount" }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: parsed.amount,
      description: parsed.description,
      category_id: parsed.category_id,
      raw_input: input,
      ai_confidence: parsed.confidence,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
