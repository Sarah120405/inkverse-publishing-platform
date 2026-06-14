import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Sarah@120405', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'sarahqureshi2005@gmail.com' },
        update: { password: hashedPassword },   // if already exists, do nothing
        create: {
            name: 'Sarah Qureshi',
            email: "sarahqureshi2005@gmail.com",
            password: hashedPassword,
            role: 'Admin',
            isEmailVerified: true,  // admin doesn't need email verification
            isActive: true,
        },

    });
    console.log('Admin created:', admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
