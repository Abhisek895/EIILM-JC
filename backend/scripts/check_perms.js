const { Database } = require('./src/config/database');
const { User } = require('./src/models');

async function run() {
  await Database.connect();
  const users = await User.findAll({ where: { roleId: 2 } }); // admin role
  users.forEach(u => {
    console.log(`Admin ${u.email}: permissions =`, JSON.stringify(u.permissions));
  });
  process.exit(0);
}
run().catch(console.error);
