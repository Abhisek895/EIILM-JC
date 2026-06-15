import dotenv from 'dotenv';
dotenv.config();
import { Database } from './src/config/database';

async function checkForeignKeys() {
  await Database.authenticate();
  try {
    const db = Database.getInstance();
    const [results] = await db.query(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'users' 
      AND REFERENCED_COLUMN_NAME = 'id';
    `);
    console.log('Foreign keys referencing users:', results);
  } catch (err: any) {
    console.error('Failed:', err.message);
  } finally {
    process.exit(0);
  }
}

checkForeignKeys();
