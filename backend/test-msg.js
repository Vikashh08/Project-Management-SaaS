const prisma = require('./src/utils/db');

async function testMsg() {
  try {
    const team = await prisma.team.findFirst();
    const user = await prisma.user.findFirst();
    if (!team || !user) {
      console.log('No team or user');
      return;
    }
    
    console.log('Attempting to create message...');
    const message = await prisma.teamMessage.create({
      data: {
        content: "Test message",
        teamId: team.id,
        senderId: user.id
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
    console.log('Success:', message);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    prisma.$disconnect();
  }
}
testMsg();
