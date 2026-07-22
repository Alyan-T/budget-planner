import type { ObjectId } from "mongodb";

export type UserDoc = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type CategoryDoc = {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  type: "income" | "expense";
};

export type TransactionDoc = {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: ObjectId | null;
  amount: number;
  description: string | null;
  rawInput: string | null;
  aiConfidence: number | null;
  occurredAt: Date;
  createdAt: Date;
};

export type BudgetDoc = {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: ObjectId;
  month: Date; // always the 1st of the month
  limitAmount: number;
};

export type RecurringBillDoc = {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  amount: number;
  categoryId: ObjectId | null;
  frequency: "weekly" | "monthly" | "yearly";
  nextDueDate: Date;
  isActive: boolean;
  createdAt: Date;
};

export type CategoryRuleDoc = {
  _id: ObjectId;
  userId: ObjectId;
  keyword: string;
  matchType: "contains" | "startsWith" | "exact";
  targetCategoryId: ObjectId;
  createdAt: Date;
};

// Default categories seeded for every new user at signup.
export const DEFAULT_CATEGORIES: { name: string; type: "income" | "expense" }[] = [
  { name: "Salary", type: "income" },
  { name: "Groceries", type: "expense" },
  { name: "Gas", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Entertainment", type: "expense" },
];

export type SavingsGoalDoc = {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  createdAt: Date;
};

export type GeneratedPlanDoc = {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  categories: { name: string; limitAmount: number }[];
  createdAt: Date;
};
