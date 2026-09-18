import * as dotenv from 'dotenv';
dotenv.config();
async function main() {
  const { prisma } = await import('../src/lib/prisma');
  const cats = await prisma.category.findMany({ include: { services: true } });
  for (const c of cats) {
    console.log(`Cat: ${c.slug}, Services: ${c.services.length}`);
    if (c.services.length > 0) {
      console.log(`  - ` + c.services.map((s: any) => s.title).join(', '));
    }
  }
  await prisma.$disconnect();
}
main().catch(console.error);
