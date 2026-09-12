import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  'postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require';

async function run() {
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to database.');

  try {
    // 1. Fix dummy data in record 1
    await client.query(`
      UPDATE "placements"
      SET "student_name" = 'Ananya Sen',
          "company_name" = 'Deloitte',
          "package" = '9.5 LPA',
          "course" = 'BBA',
          "year" = '2026',
          "status" = 'published'
      WHERE "student_name" = 'hbhj' OR "company_name" = 'khjbj'
    `);
    console.log('✅ Cleaned up dummy placement record.');

    // 2. Ensure we have at least 5 published placements
    const countRes = await client.query('SELECT COUNT(*) as c FROM "placements" WHERE "status" = \'published\'');
    const currentCount = parseInt(countRes.rows[0].c, 10);
    console.log(`Total published placements now: ${currentCount}`);

    if (currentCount < 5) {
      const needed = [
        {
          student_name: 'Debanjan Roy',
          company_name: 'Cognizant',
          package: '8.2 LPA',
          year: '2026',
          course: 'BCA',
          placement_type: 'placement',
          status: 'published',
        },
        {
          student_name: 'Pooja Mukherjee',
          company_name: 'Tata Consultancy Services',
          package: '7.5 LPA',
          year: '2026',
          course: 'BBA',
          placement_type: 'placement',
          status: 'published',
        },
        {
          student_name: 'Rohan Chakraborty',
          company_name: 'Wipro Technologies',
          package: '6.8 LPA',
          year: '2026',
          course: 'BCA',
          placement_type: 'placement',
          status: 'published',
        },
      ];

      for (let i = 0; i < (5 - currentCount) && i < needed.length; i++) {
        const item = needed[i];
        await client.query(
          `INSERT INTO "placements" ("student_name", "company_name", "package", "year", "course", "placement_type", "status", "created_at", "updated_at")
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [item.student_name, item.company_name, item.package, item.year, item.course, item.placement_type, item.status]
        );
        console.log(`✅ Seeded placement for: ${item.student_name}`);
      }
    }

    const finalRes = await client.query('SELECT id, "student_name", "company_name", "package", "course", "year" FROM "placements" WHERE "status" = \'published\' ORDER BY id ASC');
    console.log('Final top placements:');
    console.table(finalRes.rows);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
