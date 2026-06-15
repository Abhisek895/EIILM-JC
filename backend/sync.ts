import { Database } from './src/config/database';
import './src/models/index';

const syncDb = async () => {
  try {
    await Database.authenticate();
    console.log('Connected to DB');
    await Database.sync();
    console.log('Database synced');
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync', error);
    process.exit(1);
  }
};

syncDb();
