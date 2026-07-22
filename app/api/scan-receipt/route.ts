import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || "" });
    const prompt = "Extract merchant name, itemized list, subtotal, tax, total, and date from this receipt image. Return ONLY valid JSON: { merchant: string, items: [{ name: string, price: number }], subtotal: number, tax: number, total: number, date: string }";

    const result = await client.chat.complete({
      model: "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", imageUrl: `data:${file.type};base64,${base64String}` }
          ]
        }
      ],
      responseFormat: { type: "json_object" }
    });

    const responseText = result.choices && result.choices[0]?.message?.content ? result.choices[0].message.content : "{}";
    const parsedJSON = JSON.parse(responseText as string);

    return NextResponse.json(parsedJSON);
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return NextResponse.json({ error: "Failed to scan receipt" }, { status: 500 });
  }
}
