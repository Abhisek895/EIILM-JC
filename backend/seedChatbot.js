const mysql = require('mysql2/promise');

async function run() {
  const con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'eiilm_college'
  });

  const data = [
    ['Admissions', 'What is the admission process?', 'Students can apply online through the admissions portal on our website. After applying, candidates will be called for a counseling session.', 'admission, apply, application, process, how to'],
    ['Courses', 'What courses are available?', 'We offer BBA, BCA, B.Sc in Hospitality & Hotel Administration, and MBA programs. You can find full details on the Departments page.', 'courses, programs, degrees, bba, bca, mba, bsc'],
    ['Fees', 'What are the fees for BCA?', 'The approximate fee for the BCA program is around 1,50,000 INR per year. Please contact the admissions office for exact current fee structures.', 'bca, fee, cost, price, tuition'],
    ['Hostel', 'Do you provide hostel facilities?', 'Yes, we provide separate hostel facilities for boys and girls with 24/7 security, wi-fi, and mess facilities.', 'hostel, accommodation, stay, room, living'],
    ['Placements', 'What is the placement support like?', 'EIILM has a dedicated placement cell providing 100% placement assistance. Top recruiters include TCS, Wipro, Infosys, and Cognizant.', 'placement, jobs, recruiters, salary, companies'],
    ['Scholarships', 'Are there any scholarships?', 'Yes, we offer merit-based scholarships for outstanding students. Please check the Scholarships page for detailed eligibility criteria.', 'scholarship, discount, financial aid, merit']
  ];

  for(const row of data) {
    await con.query(
      "INSERT INTO chat_knowledge_base (category, question, answer, keywords, status, source, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'active', 'manual', NOW(), NOW())",
      row
    );
  }
  
  console.log('Training complete!');
  process.exit(0);
}

run();
