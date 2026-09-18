import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/lib/prisma';
async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'electricians-plumbers-carpenters' },
    include: { services: true }
  });
  console.log(JSON.stringify(cat?.services.map(s => s.title), null, 2));
}
main().finally(() => prisma.$disconnect());
