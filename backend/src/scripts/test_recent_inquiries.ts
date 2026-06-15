import { Database } from '@config/database';
import { UserService } from '@services/UserService';
import axios from 'axios';

async function run() {
  try {
    await Database.authenticate();
    console.log('✓ DB connected');

    const userService = new UserService();
    console.log("Authenticating 'admin@eiilm.edu'...");
    const result = await userService.authenticateUser('admin@eiilm.edu', 'Admin@123');
    
    if (!result) {
      console.error('❌ Auth failed');
      return;
    }

    const token = result.token;
    console.log('✓ Obtained token');

    console.log('Requesting GET /api/v1/dashboard/recent-inquiries...');
    const response = await axios.get('http://localhost:5002/api/v1/dashboard/recent-inquiries?limit=5', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Response SUCCESSFUL (status 200)');
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    if (err.response) {
      console.error(`❌ Response FAILED (status ${err.response.status})`);
      console.error('Error Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('❌ Network / Request Error:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

run();
