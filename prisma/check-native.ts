const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'electricians-plumbers-carpenters' },
    include: { services: true }
  });
  console.log("Services:", JSON.stringify(cat?.services, null, 2));
}
main().finally(() => prisma.$disconnect());
