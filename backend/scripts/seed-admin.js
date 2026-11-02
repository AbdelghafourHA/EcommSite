// scripts/seed-admin.js
import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import connectDB from "../config/db.js";
import Admin from "../models/admin.model.js";

const run = async () => {
  await connectDB();

  const rl = readline.createInterface({ input, output });

  console.log("\n🛡️  Admin seeder");
  console.log("──────────────────────────────────────");

  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  if (!email) {
    console.error("❌ Email is required");
    process.exit(1);
  }

  const password = await rl.question("Admin password (min 6 chars): ");
  if (!password || password.length < 6) {
    console.error("❌ Password must be at least 6 characters");
    process.exit(1);
  }

  rl.close();

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`⚠️  Admin with email ${email} already exists.`);
    process.exit(0);
  }

  const admin = await Admin.create({ email, password });
  console.log(`✅ Admin created: ${admin.email} (${admin._id})`);
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
