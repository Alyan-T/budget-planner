import { MongoClient } from "mongodb";

async function run() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "budget_planner";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const transactions = await db.collection("transactions").find({ categoryId: null }).toArray();
    
    for (const t of transactions) {
      const isIncome = t.rawInput && (t.rawInput.toLowerCase().includes("got paid") || t.rawInput.toLowerCase().includes("salary") || t.rawInput.toLowerCase().includes("income"));
      const type = isIncome ? "income" : "expense";
      
      const defaultMatch = await db.collection("categories").findOne({ userId: t.userId, type });
      if (defaultMatch) {
        await db.collection("transactions").updateOne(
          { _id: t._id },
          { $set: { categoryId: defaultMatch._id } }
        );
        console.log(`Updated transaction ${t._id} to category ${defaultMatch.name}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
