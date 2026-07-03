import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'deivideazevedo.dev@gmail.com' } });
  if (!user) throw new Error('User not found');
  console.log('User found:', user.id);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastActive: new Date() },
  });
  console.log('Updated:', updated.lastActive);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
