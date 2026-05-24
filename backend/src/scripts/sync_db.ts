import dotenv from 'dotenv';
import { Database } from '@config/database';
// Import all models to register them with the Sequelize instance before syncing
import '@models/index';

dotenv.config();

async function run() {
  try {
    console.log('Connecting to database...');
    await Database.authenticate();
    console.log('✓ Database connected successfully.');

    console.log('Synchronizing database schema (altering existing tables to match Sequelize models)...');
    await Database.getInstance().sync({ alter: true });
    console.log('✓ Database schema synchronized successfully with all columns and constraints.');
  } catch (error) {
    console.error('❌ Failed to synchronize database schema:', error);
  } finally {
    try {
      await Database.getInstance().close();
    } catch (_) {}
  }
}

run();
