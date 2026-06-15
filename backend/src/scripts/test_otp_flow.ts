import { Database } from '@config/database';
import { User } from '@models/User';
import { UserService } from '@services/UserService';
import axios from 'axios';

async function run() {
  try {
    console.log('Connecting to database...');
    await Database.authenticate();
    console.log('✓ Database connected');

    const userService = new UserService();
    
    // 1. Authenticate user sarkarabhisek50@gmail.com
    console.log('\n--- 1. Authenticating Admin User ---');
    const authResult = await userService.authenticateUser('sarkarabhisek50@gmail.com', 'Admin@123');
    if (!authResult) {
      throw new Error('Could not authenticate sarkarabhisek50@gmail.com');
    }
    console.log('✅ Authentication successful! Token retrieved.');
    const token = authResult.token;

    // 2. Trigger request OTP endpoint
    console.log('\n--- 2. Requesting Password Change OTP ---');
    const port = process.env.PORT || '5002'; // Active port detected is 5002/5001
    const baseUrl = `http://localhost:${port}/api/v1`;
    console.log(`Calling POST ${baseUrl}/auth/change-password/request-otp ...`);
    
    let resRequest;
    try {
      resRequest = await axios.post(
        `${baseUrl}/auth/change-password/request-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response:', resRequest.data);
    } catch (err: any) {
      console.log(`Failed on port ${port}, trying fallback port 5001...`);
      resRequest = await axios.post(
        `http://localhost:5001/api/v1/auth/change-password/request-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response (fallback):', resRequest.data);
    }

    // 3. Inspect database to read the newly generated OTP code
    console.log('\n--- 3. Reading OTP Code from User Record ---');
    const user = await User.findOne({ where: { email: 'sarkarabhisek50@gmail.com' } });
    if (!user) {
      throw new Error('User record not found');
    }
    console.log('User OTP Code stored in DB:', user.otpCode);
    console.log('User OTP Code Expiration:', user.otpExpiresAt);
    
    if (!user.otpCode) {
      throw new Error('OTP was not generated or saved in database');
    }
    const activeOtp = user.otpCode;

    // 4. Verify OTP and change password to 'Admin@321'
    console.log('\n--- 4. Verifying OTP & Changing Password to "Admin@321" ---');
    let verifyUrl = `http://localhost:${port}/api/v1/auth/change-password/verify-otp`;
    if (resRequest.config.url?.includes('5001')) {
      verifyUrl = `http://localhost:5001/api/v1/auth/change-password/verify-otp`;
    }
    const resVerify = await axios.post(
      verifyUrl,
      { otpCode: activeOtp, newPassword: 'Admin@321' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Response:', resVerify.data);

    // 5. Test authentication with the new password
    console.log('\n--- 5. Testing Authentication with NEW Password ---');
    const newAuthResult = await userService.authenticateUser('sarkarabhisek50@gmail.com', 'Admin@321');
    if (newAuthResult) {
      console.log('✅ Success! Successfully logged in with the NEW password: "Admin@321"');
    } else {
      throw new Error('Failed to authenticate with new password');
    }

    // 6. Inspect database to verify OTP columns were cleared
    console.log('\n--- 6. Verifying OTP Columns are Cleared ---');
    const userAfter = await User.findOne({ where: { email: 'sarkarabhisek50@gmail.com' } });
    console.log('User OTP Code (should be null):', userAfter?.otpCode);
    console.log('User OTP Expiry (should be null):', userAfter?.otpExpiresAt);

    // 7. Reset password back to 'Admin@123' to restore initial seed state
    console.log('\n--- 7. Restoring Initial Password "Admin@123" ---');
    userAfter!.password = 'Admin@123';
    await userAfter!.save();
    console.log('✅ Database state restored to original settings.');
    
  } catch (err: any) {
    console.error('❌ Error during integration test:', err.response?.data || err.message);
  } finally {
    process.exit(0);
  }
}

run();
