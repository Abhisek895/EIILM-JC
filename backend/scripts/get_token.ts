import { Database } from '../src/config/database';
import { User } from '../src/models/User';
import jwt from 'jsonwebtoken';
import { Config } from '../src/config/environment';

async function run() {
  try {
    await Database.authenticate();
    const user = await User.findOne({ where: { email: 'sarkarabhisek17@gmail.com' } });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, purpose: 'setup_password' },
      Config.jwt.secret as jwt.Secret,
      { expiresIn: '24h' }
    );
    const frontendUrl = Config.frontend.url;
    console.log(`\n\nSETUP URL: ${frontendUrl}/auth/setup-password?token=${token}\n\n`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
