import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { id: "32" },
        update: {},
        create: {
            id: "32",
            email: "test@example.com",
            password: "password123",
            name: "Test User",
        },
    });
    console.log("Mock user created or already exists:", user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
