import { createClient } from "@/lib/supabase/server";
import { TransactionInput } from "@/components/TransactionInput";
import { TransactionList } from "@/components/TransactionList";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, amount, description, raw_input, occurred_at, categories(name, type)")
    .eq("user_id", user!.id)
    .order("occurred_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-4">
        <TransactionInput />
      </div>
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-medium mb-2">Recent transactions</h3>
        <TransactionList transactions={(transactions ?? []) as any} />
      </div>
    </div>
  );
}
