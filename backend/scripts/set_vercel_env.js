const { execSync } = require('child_process');

const envs = [
  { name: 'NODE_ENV', value: 'production' },
  { name: 'DATABASE_URL', value: 'postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require' },
  { name: 'POSTGRES_URL', value: 'postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require' },
  { name: 'PRISMA_DATABASE_URL', value: 'postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require' },
  { name: 'BLOB_READ_WRITE_TOKEN', value: 'vercel_blob_rw_AFFJp3AMkUftPkUN_60ayZLpsEWIXKRSFfiCAYP2P4l5eD7' },
  { name: 'BLOB_STORE_ID', value: 'store_AFFJp3AMkUftPkUN' },
  { name: 'FRONTEND_URL', value: 'https://eiilm-jc.vercel.app,https://frontend-eiilm-web.vercel.app' },
  { name: 'JWT_SECRET', value: 'e8f4c9a2d1b7e635482910f5c3b8a7d9e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2' },
  { name: 'JWT_REFRESH_SECRET', value: '7a1b3c5d9e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b' },
  { name: 'APP_NAME', value: 'EIILM Kolkata Jalpaiguri Campus ERP' }
];

for (const env of envs) {
  try {
    console.log('Adding', env.name);
    execSync(`npx vercel env add ${env.name} production --value "${env.value}" --yes --force`, {
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
  } catch (err) {
    console.error('Error adding', env.name, err.message);
  }
}
console.log('Done configuring Vercel environment variables.');
