import { Database } from '../config/database';

async function run() {
  try {
    const db = Database.getInstance();
    await db.query("ALTER TABLE infrastructures MODIFY COLUMN category ENUM('facility', 'tour', 'campus_highlight', 'hero') DEFAULT 'facility' NOT NULL;");
    console.log('ALTER query executed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error executing query:', error);
    process.exit(1);
  }
}

run();