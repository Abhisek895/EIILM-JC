import { Database } from '../src/config/database';

async function run() {
  try {
    const db = Database.getInstance();
    const [roles] = await db.query('SELECT * FROM roles');
    console.log(roles);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
