import { Database } from '../config/database';
import '../models/index';
import { DashboardService } from '../services/DashboardService';

async function test() {
  await Database.authenticate();
  const service = new DashboardService();
  try {
    const data = await service.getAnalytics();
    console.log(data);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
test();
