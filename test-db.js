require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function testConnection() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    connection: {
      options: `project=${process.env.DATABASE_URL.split('.')[1].split(':')[0]}`
    }
  });

  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully:', result);
    await sql.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();