// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Wiping all records from the database across all tables...');

  // 1. Delete all dependent child records
  await prisma.soloSubmission.deleteMany();
  await prisma.teamFile.deleteMany();
  await prisma.teamMessage.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.project.deleteMany();
  await prisma.peerProject.deleteMany();
  await prisma.priorProject.deleteMany();
  await prisma.platformProject.deleteMany();
  await prisma.collaborationRequest.deleteMany();
  await prisma.commentReply.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.verificationToken.deleteMany();

  // 2. Delete all users (students, instructors, admins)
  await prisma.user.deleteMany();

  console.log('✅ Database completely wiped clean! 100% empty initial state.');
}

main()
  .catch((e) => {
    console.error('❌ Database wipe error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
