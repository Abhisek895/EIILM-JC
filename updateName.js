const fs = require('fs');

const loginPath = 'frontend/src/pages/auth/login.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');
loginContent = loginContent.replace(/EIILM College/g, 'EIILM Kolkata Jalpaiguri Campus');
fs.writeFileSync(loginPath, loginContent);

const setupPath = 'frontend/src/pages/auth/setup-password.tsx';
let setupContent = fs.readFileSync(setupPath, 'utf8');
setupContent = setupContent.replace(/EIILM-JC/g, 'EIILM Kolkata Jalpaiguri Campus');
fs.writeFileSync(setupPath, setupContent);

console.log('Auth pages updated successfully');
