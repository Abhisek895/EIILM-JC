import { Database } from '@config/database';
import { UserService } from '@services/UserService';

async function run() {
  try {
    await Database.authenticate();
    console.log('✓ DB connected');

    const userService = new UserService();
    console.log("Authenticating 'admin@eiilm.edu' with 'Admin@123'...");
    const result = await userService.authenticateUser('admin@eiilm.edu', 'Admin@123');
    
    if (result) {
      console.log('✅ Authentication SUCCESSFUL!');
      console.log('User:', JSON.stringify(result.user, null, 2));
    } else {
      console.log('❌ Authentication FAILED!');
    }
  } catch (err: any) {
    console.error('❌ Error during authentication:', err.message, err.stack);
  } finally {
    process.exit(0);
  }
}

run();
