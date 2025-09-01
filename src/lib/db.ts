// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Get the database URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres connection
const client = postgres(connectionString, {
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle database instance
export const db = drizzle(client);

// Helper function to test database connection
export async function testConnection() {
  try {
    const result = await client`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return { success: true, result };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}

// Close connection (useful for scripts)
export async function closeConnection() {
  await client.end();
}