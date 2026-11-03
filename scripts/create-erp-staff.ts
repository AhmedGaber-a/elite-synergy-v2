// Run locally with DATABASE_URL set:
//   npx tsx scripts/create-erp-staff.ts email@elitesynergy.com "StrongPassword" ADMIN
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

async function main() {
  const [email, password, role = 'STAFF'] = process.argv.slice(2);
  if (!email || !password || password.length < 12) {
    console.error('Usage: create-erp-staff.ts <email> <password (12+ chars)> [STAFF|REVIEWER|ADMIN]');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.erpStaff.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { passwordHash, role, active: true, failedAttempts: 0, lockedUntil: null },
    create: { email: email.toLowerCase().trim(), passwordHash, role },
  });
  console.log(`ERP staff saved: ${email} (${role})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
