const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.weddingProject.findMany();
  console.log(`Checking ${projects.length} projects...`);

  for (const project of projects) {
    if (project.slug.includes('&')) {
      const newSlug = project.slug.replace(/&/g, '-');
      console.log(`Updating slug: ${project.slug} -> ${newSlug}`);
      
      try {
        await prisma.weddingProject.update({
          where: { id: project.id },
          data: { slug: newSlug }
        });
      } catch (err) {
        console.error(`Failed to update project ${project.id}:`, err.message);
      }
    }
  }

  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
