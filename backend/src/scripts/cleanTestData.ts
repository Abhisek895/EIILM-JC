import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  'postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require';

async function run() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to database.');

  try {
    // 1. Fix Faculty typo: 'Camus Head' -> 'Campus Head'
    const facultyRes = await client.query(`
      UPDATE "faculty"
      SET "designation" = REPLACE("designation", 'Camus', 'Campus')
      WHERE "designation" ILIKE '%Camus%'
    `);
    console.log(`✅ Fixed faculty designations: ${facultyRes.rowCount} rows updated.`);

    // 2. Fix Site Settings
    // Fix tagline if gibberish or contains 'vne rhkje'
    const taglineRes = await client.query(`
      UPDATE "site_settings"
      SET "value" = 'A student-first college experience focused on industry-oriented learning and career outcomes.'
      WHERE "key_name" = 'tagline' AND ("value" ILIKE '%vne rhkje%' OR LENGTH("value") < 10)
    `);
    console.log(`✅ Fixed tagline setting: ${taglineRes.rowCount} rows updated.`);

    // Fix contact email if personal email
    const emailRes = await client.query(`
      UPDATE "site_settings"
      SET "value" = 'admission@eiilm.co.in'
      WHERE "key_name" = 'email' AND "value" ILIKE '%sarkarabhisek50%'
    `);
    console.log(`✅ Fixed contact email setting: ${emailRes.rowCount} rows updated.`);

    // Fix accreditations to remove IRCTC
    const accRes = await client.query(`
      SELECT "id", "value" FROM "site_settings" WHERE "key_name" = 'about_accreditations'
    `);
    if (accRes.rows.length > 0) {
      const currentVal = accRes.rows[0].value || '';
      const cleaned = currentVal
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s && s.toUpperCase() !== 'IRCTC')
        .join(', ');
      await client.query(`
        UPDATE "site_settings" SET "value" = $1 WHERE "key_name" = 'about_accreditations'
      `, [cleaned]);
      console.log(`✅ Cleaned accreditations (removed IRCTC): "${cleaned}".`);
    }

    // Fix home features if it contains test string
    const featRes = await client.query(`
      UPDATE "site_settings"
      SET "value" = 'Practical Learning & Industry Engagement'
      WHERE "value" ILIKE '%hey im abhisek%'
    `);
    console.log(`✅ Cleaned test features: ${featRes.rowCount} rows updated.`);

    // Upsert placement & college statistics in site_settings
    const statsToSet = [
      { key: 'stat_students', value: '1500+' },
      { key: 'stat_faculty', value: '45+' },
      { key: 'stat_courses', value: '12+' },
      { key: 'stat_years', value: '15+' },
      { key: 'stat_placements', value: '100+' },
      { key: 'stat_internships', value: '50+' },
      { key: 'stat_companies', value: '35+' },
      { key: 'placement_hero_tagline', value: 'Career Outcomes & Excellence' },
      { key: 'placement_hero_heading', value: 'Outstanding Placements' },
      { key: 'placement_hero_subheading', value: 'Celebrating our students securing career roles in premier national and multinational organizations.' }
    ];

    for (const item of statsToSet) {
      const updateResult = await client.query(`
        UPDATE "site_settings" SET "value" = $1 WHERE "key_name" = $2 AND ("value" IS NULL OR "value" = '' OR "value" = '0')
      `, [item.value, item.key]);

      if (updateResult.rowCount === 0) {
        // Check if exists
        const exists = await client.query(`SELECT 1 FROM "site_settings" WHERE "key_name" = $1`, [item.key]);
        if (exists.rows.length === 0) {
          await client.query(`
            INSERT INTO "site_settings" ("key_name", "value") VALUES ($1, $2)
          `, [item.key, item.value]);
        }
      }
    }
    console.log('✅ Verified site_settings placement statistics.');

    // 3. Fix Hero slider typo: 'Addmitiomnopen' -> 'Admissions Open 2026-27'
    const sectionRes = await client.query(`
      SELECT "id", "config" FROM "page_sections" WHERE "page_key" = 'home' AND "section_key" = 'hero'
    `);
    if (sectionRes.rows.length > 0) {
      const row = sectionRes.rows[0];
      let configStr = typeof row.config === 'string' ? row.config : JSON.stringify(row.config);
      if (configStr.includes('Addmitiomnopen') || configStr.includes('Addmitiom')) {
        configStr = configStr.replace(/Addmitiomnopen/g, 'Admissions Open 2026-27');
        configStr = configStr.replace(/Addmitiom\s*open/gi, 'Admissions Open 2026-27');
        const parsed = JSON.parse(configStr);
        await client.query(`
          UPDATE "page_sections" SET "config" = $1, "updated_at" = NOW() WHERE "id" = $2
        `, [parsed, row.id]);
        console.log('✅ Fixed hero slider typo in page_sections.');
      } else {
        console.log('ℹ️ Hero slider config already clean.');
      }
    }

    // 4. Clean Dummy Notices: remove 'jhbhj', 'kjnh', 'xyz' or notices dated 2028
    const delNotices = await client.query(`
      DELETE FROM "notices"
      WHERE "title" ILIKE ANY (ARRAY['%jhbhj%', '%kjnh%', '%xyz%'])
         OR "publish_date" > '2027-01-01'
    `);
    console.log(`✅ Removed dummy notices: ${delNotices.rowCount} deleted.`);

    // Check remaining notices count
    const remainingNotices = await client.query(`SELECT COUNT(*) as c FROM "notices"`);
    if (parseInt(remainingNotices.rows[0].c, 10) === 0) {
      await client.query(`
        INSERT INTO "notices" ("title", "description", "publish_date", "priority", "status", "created_at", "updated_at")
        VALUES 
          ('Admissions Open for Academic Session 2026-27', 'Applications are invited for UG and PG degree programs. Apply online or contact the admissions helpdesk.', '2026-06-01', 'high', 'published', NOW(), NOW()),
          ('Odd Semester Academic Calendar & Examination Schedule', 'All enrolled students are notified that the updated semester calendar and class schedule have been published.', '2026-08-15', 'medium', 'published', NOW(), NOW())
      `);
      console.log('✅ Seeded 2 realistic official notices.');
    }

    // 5. Clean Dummy Events: remove 'xyz' or descriptions like 'hgftyf'
    const delEvents = await client.query(`
      DELETE FROM "events"
      WHERE "title" ILIKE ANY (ARRAY['%xyz%', '%dummy%', '%test%'])
         OR "description" ILIKE '%hgftyf%'
         OR "start_date" > '2027-01-01'
    `);
    console.log(`✅ Removed dummy events: ${delEvents.rowCount} deleted.`);

    // Check remaining events count
    const remainingEvents = await client.query(`SELECT COUNT(*) as c FROM "events"`);
    if (parseInt(remainingEvents.rows[0].c, 10) === 0) {
      await client.query(`
        INSERT INTO "events" ("title", "description", "start_date", "end_date", "location", "status", "created_at", "updated_at")
        VALUES 
          ('Annual Management & Tech Conclave 2026', 'Distinguished industry leaders and corporate practitioners converge to share insights on emerging trends with students.', '2026-10-15', '2026-10-16', 'Auditorium, EIILM Jalpaiguri Campus', 'published', NOW(), NOW()),
          ('Campus Orientation & Induction Week', 'Welcoming incoming students with campus tours, department briefings, and student mentorship activities.', '2026-09-22', '2026-09-24', 'Seminar Hall, EIILM Jalpaiguri Campus', 'published', NOW(), NOW())
      `);
      console.log('✅ Seeded 2 realistic official events.');
    }

    console.log('\n🎉 ALL DATABASE HYGIENE & CLEANUP COMPLETED SUCCESSFULLY!');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
