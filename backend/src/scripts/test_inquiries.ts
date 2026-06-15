import { Database } from '@config/database';
import { Inquiry } from '@models/Inquiry';

async function run() {
  try {
    await Database.authenticate();
    console.log('✓ DB connected');
    
    console.log('Testing Inquiry.findAll()...');
    const inquiries = await Inquiry.findAll({
      order: [['id', 'DESC']],
      limit: 5,
    });
    console.log('Inquiries fetched successfully:', inquiries.length);
  } catch (err: any) {
    console.error('❌ Error querying inquiries:', err.message, err.stack);
  } finally {
    process.exit(0);
  }
}

run();
