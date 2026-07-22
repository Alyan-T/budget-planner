import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB || "budget_planner";
    const db = client.db(dbName);
    
    const email = "admin@budgetplanner.local";
    const password = "AdminPassword123!";
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = {
      email,
      passwordHash: passwordHash,
      createdAt: new Date(),
    };
    
    const users = db.collection('users');
    await users.updateOne(
       { email },
       { $set: user },
       { upsert: true }
    );
    console.log("Admin user fixed/created successfully in MongoDB!");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Error connecting to MongoDB or creating user:", error);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
