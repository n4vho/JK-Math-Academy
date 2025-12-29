import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const phone = "01700000000";
  const pin = "123456";

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser) {
    console.log(`Admin user with phone ${phone} already exists. Skipping seed.`);
    return;
  }

  // Hash the PIN
  const pinHash = await bcrypt.hash(pin, 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      phone,
      role: "ADMIN",
      pinHash,
    },
  });

  console.log(`Created admin user:`, {
    id: adminUser.id,
    phone: adminUser.phone,
    role: adminUser.role,
  });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

