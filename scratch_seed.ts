import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({ take: 3 });
  for (const cat of cats) {
    await prisma.category.update({ where: { id: cat.id }, data: { isPopular: true } });
  }
  const svcs = await prisma.service.findMany({ take: 6 });
  for (const svc of svcs) {
    await prisma.service.update({ where: { id: svc.id }, data: { isPopular: true } });
  }
  console.log("Updated categories and services to be popular.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
