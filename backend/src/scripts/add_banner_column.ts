import { Database } from '@config/database';

async function run() {
  const db = Database.getInstance();
  try {
    await db.query('ALTER TABLE courses ADD COLUMN banner VARCHAR(1000) NULL AFTER description');
    console.log('✅ banner column added to courses table!');
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('duplicate column')) {
      console.log('⚠️  banner column already exists, skipping.');
    } else {
      console.error('❌', err.message);
      process.exit(1);
    }
  }
  process.exit(0);
}

run();
