const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  max: 10, // Limit active connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;

