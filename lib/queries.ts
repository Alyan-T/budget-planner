import { ObjectId, type Db } from "mongodb";
import type { CategoryDoc, TransactionDoc } from "@/lib/models";

/** Map of categoryId string -> category, scoped to one user. */
export async function getCategoryMap(
  db: Db,
  userId: ObjectId
): Promise<Map<string, CategoryDoc>> {
  const categories = await db
    .collection<CategoryDoc>("categories")
    .find({ userId })
    .toArray();
  return new Map(categories.map((c) => [c._id.toString(), c]));
}

export type TransactionWithCategory = TransactionDoc & {
  category: { name: string; type: "income" | "expense" } | null;
};

/** Attaches { name, type } from the category map onto each transaction. */
export function attachCategories(
  transactions: TransactionDoc[],
  categoryMap: Map<string, CategoryDoc>
): TransactionWithCategory[] {
  return transactions.map((t) => {
    const cat = t.categoryId ? categoryMap.get(t.categoryId.toString()) : undefined;
    return {
      ...t,
      category: cat ? { name: cat.name, type: cat.type } : null,
    };
  });
}
