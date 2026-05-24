import { Database } from '@config/database';
import { User } from '@models/User';
import bcrypt from 'bcryptjs';

async function run() {
  try {
    await Database.authenticate();
    console.log('✓ DB connected');

    const users = await User.findAll();
    console.log(`Found ${users.length} users in the database:\n`);

    for (const u of users) {
      const plainPassword = 'Admin@123';
      const isValid = await bcrypt.compare(plainPassword, u.password);
      
      console.log(`User: ${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Status: ${u.status}`);
      console.log(`  Hash in DB: ${u.password}`);
      console.log(`  Valid against 'Admin@123': ${isValid ? '✅ YES' : '❌ NO'}`);
      console.log('---');
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
