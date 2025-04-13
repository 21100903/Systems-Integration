const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearPosts() {
  try {
    await prisma.post.deleteMany({}); // This deletes all records in the "Post" table.
    console.log('All posts have been deleted.');
  } catch (error) {
    console.error('Error while deleting posts:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

clearPosts();
