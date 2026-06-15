import { Database } from '../src/config/database';

async function run() {
  const db = Database.getInstance();
  try {
    console.log('Connecting to database...');
    await db.authenticate();
    console.log('Connected.');
    
    // Check if column exists
    const [results] = await db.query(`SHOW COLUMNS FROM users LIKE 'permissions'`);
    if ((results as any[]).length === 0) {
      console.log('Adding permissions column to users table...');
      await db.query(`ALTER TABLE users ADD COLUMN permissions JSON DEFAULT NULL`);
      console.log('Successfully added permissions column.');
    } else {
      console.log('Permissions column already exists.');
    }
  } catch (error) {
    console.error('Error modifying users table:', error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

run();
