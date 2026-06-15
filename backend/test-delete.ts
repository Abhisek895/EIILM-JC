import dotenv from 'dotenv';
dotenv.config();
import { Database } from './src/config/database';
import { UserService } from './src/services/UserService';
import { User } from './src/models/index';

async function testDelete() {
  await Database.authenticate();
  const userService = new UserService();
  try {
    // Find a test user or the student user
    const user = await User.findOne({ where: { email: 'student@eiilm.edu' } });
    if (!user) {
      console.log('No student user found. Creating one...');
      // create logic...
      return;
    }
    
    console.log(`Attempting to delete user ${user.id} (${user.email})...`);
    await userService.deleteUser(user.id);
    console.log('Successfully deleted user!');
  } catch (err: any) {
    console.error('Failed to delete user:', err.message);
    if (err.parent) {
      console.error('Parent error:', err.parent);
    }
  } finally {
    process.exit(0);
  }
}

testDelete();
