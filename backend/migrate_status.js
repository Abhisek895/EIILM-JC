const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('eiilm_college', 'root', 'root', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.query("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'blocked', 'pending') DEFAULT 'active';");
    console.log('Successfully updated status ENUM');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

run();
