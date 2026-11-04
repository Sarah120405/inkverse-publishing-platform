import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Sarah@120405", 10);
  const admin = await prisma.user.upsert({
    where: { email: "sarahqureshi2005@gmail.com" },
    update: { password: hashedPassword }, // if already exists, do nothing
    create: {
      name: "Sarah Qureshi",
      email: "sarahqureshi2005@gmail.com",
      password: hashedPassword,
      role: "Admin",
      isEmailVerified: true, // admin doesn't need email verification
      isActive: true,
    },
  });
  console.log("Admin created:", admin.email);
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      totalBalance: 0,
      currentBalance: 0,
      totalWithdrawn: 0,
    },
  });

  console.log("Admin wallet created or already exists.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
