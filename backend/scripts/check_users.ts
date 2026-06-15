import { Database } from '../src/config/database';
import { User } from '../src/models/User';

async function run() {
  try {
    await Database.authenticate();
    const users = await User.findAll();
    console.log(`FOUND ${users.length} USERS`);
    console.log(users.map(u => u.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
