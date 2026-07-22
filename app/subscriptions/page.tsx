import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { RecurringBillDoc, CategoryDoc } from "@/lib/models";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { AddSubscriptionForm } from "@/components/AddSubscriptionForm";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = new ObjectId(user.userId);

  const db = await getDb();
  const bills = await db
    .collection<RecurringBillDoc>("recurringBills")
    .find({ userId, isActive: true })
    .sort({ nextDueDate: 1 })
    .toArray();

  const categoryIds = Array.from(
    new Set(bills.map((b) => b.categoryId?.toString()).filter(Boolean))
  ).map((id) => new ObjectId(id as string));

  const categories = await db
    .collection<CategoryDoc>("categories")
    .find({ _id: { $in: categoryIds } })
    .toArray();

  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));

  let totalMonthlyCost = 0;
  const activeCount = bills.length;

  const formattedBills = bills.map((b) => {
    // Calculate monthly equivalent
    let monthlyAmount = b.amount;
    if (b.frequency === "weekly") monthlyAmount = b.amount * 4.33;
    else if (b.frequency === "yearly") monthlyAmount = b.amount / 12;

    totalMonthlyCost += monthlyAmount;

    return {
      id: b._id.toString(),
      name: b.name,
      amount: b.amount,
      frequency: b.frequency,
      nextDueDate: b.nextDueDate.toISOString(),
      categoryName: b.categoryId ? categoryMap.get(b.categoryId.toString()) || null : null,
      isActive: b.isActive,
    };
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingBills = formattedBills.filter((b) => {
    const due = new Date(b.nextDueDate);
    due.setHours(0, 0, 0, 0);
    return due >= now && due <= thirtyDaysFromNow;
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Hero Section */}
      <div className="bg-background flex flex-col gap-6 relative mt-4">
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-bold tracking-widest uppercase text-on-surface-variant">
            RECURRING EXPENSES
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-[32px] md:text-[40px] font-bold tracking-tight text-primary">
              Rs. {totalMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[12px] md:text-[14px] w-fit font-bold text-success bg-success-bg px-3 py-1 rounded-full">
              {activeCount} Subscriptions
            </span>
          </div>
        </div>
      </div>

      <AddSubscriptionForm />

      {/* Upcoming Section */}
      {upcomingBills.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[18px] font-bold text-primary px-2">Due in Next 30 Days</h3>
          <div className="flex flex-col gap-3">
            {upcomingBills.map((bill) => (
              <SubscriptionCard key={`upcoming-${bill.id}`} {...bill} />
            ))}
          </div>
        </div>
      )}

      {/* All Subscriptions */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[18px] font-bold text-primary px-2">All Subscriptions</h3>
        {formattedBills.length === 0 ? (
          <p className="text-on-surface-variant text-[14px] px-2">
            No active subscriptions. Use the form above to add one!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {formattedBills.map((bill) => (
              <SubscriptionCard key={bill.id} {...bill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
