const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure localtunnel is installed
try {
  require.resolve('localtunnel');
} catch (e) {
  console.log('Installing localtunnel (this will take a few seconds)...');
  execSync('npm install localtunnel --no-save', { stdio: 'inherit' });
}

const localtunnel = require('localtunnel');

async function startTunnels() {
  console.log('Starting backend tunnel on port 3003...');
  const backendTunnel = await localtunnel({ port: 3003 });
  console.log(`✅ Backend accessible globally at: ${backendTunnel.url}`);

  // Update frontend/.env.local
  const envPath = path.join(__dirname, 'frontend', '.env.local');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace NEXT_PUBLIC_API_URL
    if (/NEXT_PUBLIC_API_URL=.*/.test(envContent)) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_API_URL=.*/g,
        `NEXT_PUBLIC_API_URL=${backendTunnel.url}/api/v1`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_API_URL=${backendTunnel.url}/api/v1`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated frontend/.env.local with new public backend URL.`);
  } else {
    console.error('⚠️ Could not find frontend/.env.local to update the API URL.');
  }

  console.log('\nStarting frontend tunnel on port 3000...');
  const frontendTunnel = await localtunnel({ port: 3000 });
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎉 FRONTEND LIVE PREVIEW URL: ${frontendTunnel.url}`);
  console.log(`🎉 BACKEND LIVE PREVIEW URL:  ${backendTunnel.url}`);
  console.log('='.repeat(60) + '\n');
  
  console.log('⚠️  IMPORTANT NOTE:');
  console.log('When you visit the URL for the first time, LocalTunnel will show a warning page asking for an IP address or password.');
  console.log('Just click "Click to Continue" to view your site.');
  
  console.log('\nShare the FRONTEND URL above with your team/friends!');
  console.log('Press Ctrl+C to stop both tunnels.\n');

  frontendTunnel.on('close', () => {
    console.log('Frontend tunnel closed.');
  });
  
  backendTunnel.on('close', () => {
    console.log('Backend tunnel closed.');
  });

  // Handle termination gracefully
  process.on('SIGINT', () => {
    console.log('\nClosing tunnels...');
    frontendTunnel.close();
    backendTunnel.close();
    
    // Revert the frontend/.env.local to use localhost so local development doesn't break later
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(
        /NEXT_PUBLIC_API_URL=.*/g,
        `NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1`
      );
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Reverted frontend/.env.local back to localhost:3003 for local development.');
    }
    
    process.exit(0);
  });
}

startTunnels().catch(err => {
  console.error('Error starting tunnels:', err);
});
