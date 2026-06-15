import { Database } from '../src/config/database';

async function run() {
  try {
    const db = Database.getInstance();
    await db.query("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'blocked', 'pending') DEFAULT 'active';");
    console.log("Successfully altered users table");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
