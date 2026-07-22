import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryMap, attachCategories } from "@/lib/queries";
import type { TransactionDoc } from "@/lib/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = new ObjectId(user.userId);
  const db = await getDb();

  const rawTransactions = await db
    .collection<TransactionDoc>("transactions")
    .find({ userId })
    .sort({ occurredAt: -1 })
    .toArray();

  const categoryMap = await getCategoryMap(db, userId);
  const transactions = attachCategories(rawTransactions, categoryMap);

  const header = "Date,Amount,Category,Description\n";
  const rows = transactions.map((t) => {
    const date = t.occurredAt.toISOString().split("T")[0];
    const amount = t.amount;
    const category = t.category ? t.category.name : "Uncategorized";
    const desc = (t.description || "").replace(/,/g, " ");
    return `${date},${amount},${category},${desc}`;
  });

  const csvContent = header + rows.join("\n");

  const headers = new Headers();
  headers.set("Content-Type", "text/csv");
  headers.set("Content-Disposition", 'attachment; filename="budget-export.csv"');

  return new NextResponse(csvContent, {
    status: 200,
    headers,
  });
}
