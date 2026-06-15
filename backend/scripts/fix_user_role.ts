import { Database } from '../src/config/database';
import { User } from '../src/models/User';

async function run() {
  try {
    await Database.authenticate();
    const user = await User.findOne({ where: { email: 'sarkarabhisek17@gmail.com' } });
    if (user) {
      user.roleId = 2; // Admin
      await user.save();
      console.log('User role updated to Admin');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
