import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { GoalCard } from "@/components/GoalCard";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const db = await getDb();
  const goals = await db.collection("savingsGoals").find({ userId: new ObjectId(user.userId) }).sort({ createdAt: -1 }).toArray();

  async function createGoal(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const targetAmount = parseFloat(formData.get("targetAmount") as string);
    const targetDate = formData.get("targetDate") as string;
    
    if (!name || isNaN(targetAmount)) return;

    const db = await getDb();
    const user = await getCurrentUser();
    if (!user) return;

    await db.collection("savingsGoals").insertOne({
      userId: new ObjectId(user.userId),
      name,
      targetAmount,
      currentAmount: 0,
      targetDate: targetDate ? new Date(targetDate) : null,
      createdAt: new Date(),
    });
    revalidatePath("/goals");
  }

  return (
    <div className="max-w-[1440px] mx-auto p-[20px] md:p-[32px] flex flex-col gap-8">
      <h1 className="text-[32px] md:text-[40px] text-primary font-bold tracking-tight">SAVINGS GOALS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-3xl p-6 shadow-soft flex flex-col gap-4">
          <h2 className="text-primary font-bold text-xl">Create New Goal</h2>
          <form action={createGoal} className="flex flex-col gap-4">
            <input
              name="name"
              type="text"
              required
              placeholder="Goal Name (e.g. Vacation)"
              className="bg-surface-dim w-full min-w-0 rounded-2xl px-4 py-3 text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              name="targetAmount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Target Amount"
              className="bg-surface-dim w-full min-w-0 rounded-2xl px-4 py-3 text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              name="targetDate"
              type="date"
              className="bg-surface-dim w-full min-w-0 rounded-2xl px-4 py-3 text-[14px] text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button type="submit" className="bg-primary text-on-primary w-full py-3 rounded-2xl font-bold shadow-soft hover:opacity-90">
              Create Goal
            </button>
          </form>
        </div>

        {goals.map((g) => (
          <GoalCard
            key={g._id.toString()}
            goal={{
              _id: g._id.toString(),
              name: g.name,
              targetAmount: g.targetAmount,
              currentAmount: g.currentAmount,
              targetDate: g.targetDate ? g.targetDate.toISOString() : null
            }}
          />
        ))}
      </div>
    </div>
  );
}
