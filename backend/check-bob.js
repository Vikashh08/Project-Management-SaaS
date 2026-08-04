const prisma = require('./src/utils/db');

async function checkBob() {
  try {
    const bob = await prisma.user.findFirst({
      where: { name: { contains: 'bob', mode: 'insensitive' } }
    });

    if (!bob) {
      console.log('Bob not found in users table.');
      return;
    }

    console.log('Bob:', bob.id, bob.name, bob.email);

    const orgMemberships = await prisma.organizationMember.findMany({
      where: { userId: bob.id }
    });
    console.log('Org Memberships:', orgMemberships);

    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId: bob.id },
      include: { team: true }
    });
    console.log('Team Memberships:', teamMemberships.map(tm => ({ teamId: tm.teamId, teamName: tm.team.name, orgId: tm.team.organizationId })));

  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}

checkBob();
