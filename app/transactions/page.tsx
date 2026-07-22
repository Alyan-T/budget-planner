import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryMap, attachCategories } from "@/lib/queries";
import type { TransactionDoc } from "@/lib/models";
import { TransactionEntry } from "@/components/TransactionEntry";
import { TransactionList } from "@/components/TransactionList";
import { ReceiptText, ArrowRightLeft, Search } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = new ObjectId(user.userId);

  const db = await getDb();

  const rawTransactions = await db
    .collection<TransactionDoc>("transactions")
    .find({ userId })
    .sort({ occurredAt: -1 })
    .limit(50)
    .toArray();

  const categoryMap = await getCategoryMap(db, userId);
  const transactions = attachCategories(rawTransactions, categoryMap);

  // Shape expected by <TransactionList>: id (string), categories: {name, type}
  const rows = transactions.map((t) => ({
    id: t._id.toString(),
    amount: t.amount,
    description: t.description,
    raw_input: t.rawInput,
    occurred_at: t.occurredAt.toISOString(),
    categories: t.category,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-[24px] font-bold text-primary">Transactions</h1>
        <ExportButton />
      </div>
      <div className="bg-surface rounded-3xl p-6 shadow-soft">
        <div className="flex flex-col gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-on-surface-variant" />
            </div>
            <input
              placeholder="Search transactions..."
              className="w-full h-[48px] pl-11 pr-4 bg-surface-dim rounded-2xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button className="px-5 py-2 bg-primary text-on-primary rounded-full text-[13px] font-bold whitespace-nowrap">All Time</button>
            <button className="px-5 py-2 bg-surface-dim text-on-surface-variant rounded-full text-[13px] font-bold whitespace-nowrap">Last 7 Days</button>
            <button className="px-5 py-2 bg-surface-dim text-on-surface-variant rounded-full text-[13px] font-bold whitespace-nowrap">This Month</button>
            <button className="px-5 py-2 bg-surface-dim text-on-surface-variant rounded-full text-[13px] font-bold whitespace-nowrap">Custom</button>
          </div>
        </div>
      </div>
      <div className="bg-surface rounded-3xl p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <ReceiptText size={20} className="text-primary" />
          <h2 className="text-[18px] font-bold text-primary">Add Transaction</h2>
        </div>
        <TransactionEntry />
      </div>
      
      <div className="flex flex-col gap-4">
        <TransactionList transactions={rows} />
      </div>
    </div>
  );
}
