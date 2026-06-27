import { SiteSetting } from './src/models';

async function run() {
  const existing = await SiteSetting.findOne({ where: { keyName: 'contact_map_url' } });
  if (existing) {
    existing.value = 'https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus&t=m&z=15&output=embed';
    await existing.save();
  } else {
    await SiteSetting.create({ keyName: 'contact_map_url', value: 'https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus&t=m&z=15&output=embed' } as any);
  }
  console.log('Map URL fixed!');
  process.exit(0);
}
run().catch(console.error);
