const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection('mysql://sql12825010:IA41Vd3p8j@sql12.freesqldatabase.com:3306/sql12825010?connect_timeout=30');
  const [rows] = await connection.execute('SELECT * FROM page_sections WHERE page_key = ? AND section_key = ?', ['courses', 'hero']);
  if (rows.length === 0) {
    await connection.execute('INSERT INTO page_sections (page_key, section_key, config, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', ['courses', 'hero', JSON.stringify({ slides: [{ heading: 'Explore Our Courses', subheading: 'Discover the perfect program to advance your career.', imageUrl: '', primaryCta: { label: 'View All Courses', href: '#courses' } }] }), 'active', 0]);
    console.log('Inserted courses hero slide');
  } else {
    const section = rows[0];
    const config = section.config ? (typeof section.config === 'string' ? JSON.parse(section.config) : section.config) : {};
    config.slides = config.slides || [];
    if (config.slides.length === 0) {
      config.slides.push({ heading: 'Explore Our Courses', subheading: 'Discover the perfect program to advance your career.', imageUrl: '', primaryCta: { label: 'View All Courses', href: '#courses' } });
      await connection.execute('UPDATE page_sections SET config = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(config), section.id]);
      console.log('Updated courses hero slide');
    } else {
      console.log('Already has slides');
    }
  }
  await connection.end();
}
run().catch(console.error);
