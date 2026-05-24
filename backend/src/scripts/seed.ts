import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Database } from '@config/database';

// !! CRITICAL: Import models/index FIRST — this registers all associations
// before any query runs. Never import individual model files in scripts.
import {
  Role,
  User,
  Course,
  Department,
  Faculty,
  Notice,
  Event,
  SiteSetting,
  PageSection,
} from '@models/index';

dotenv.config();

// ─── ROLES ──────────────────────────────────────────────────────────────────────

const rolesToSeed = [
  { name: 'super_admin', description: 'Platform super administrator' },
  { name: 'admin', description: 'College administrator' },
  { name: 'faculty', description: 'Faculty member' },
  { name: 'student', description: 'Student user' },
];

const seedRoles = async (): Promise<void> => {
  console.log('  Seeding roles...');
  for (const role of rolesToSeed) {
    await Role.findOrCreate({
      where: { name: role.name },
      defaults: role,
    });
  }
  console.log(`  ✓ ${rolesToSeed.length} roles seeded`);
};

// ─── USERS ───────────────────────────────────────────────────────────────────────

const seedUsers = async (): Promise<void> => {
  console.log('  Seeding users...');

  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  const studentRole = await Role.findOne({ where: { name: 'student' } });

  if (!adminRole || !studentRole) {
    throw new Error('Roles not found. seedRoles() must run first.');
  }

  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL || 'admin@eiilm.edu'
  )
    .toLowerCase()
    .trim();
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  const studentEmail = (
    process.env.SEED_STUDENT_EMAIL || 'student@eiilm.edu'
  )
    .toLowerCase()
    .trim();
  const studentPassword =
    process.env.SEED_STUDENT_PASSWORD || 'Student@123';

  // ── Admin ────────────────────────────────────────────────────────────────────
  const [admin, adminCreated] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      name: 'System Admin',
      // Pass the PLAIN password so the beforeCreate hook hashes it correctly
      password: adminPassword,
      roleId: adminRole.id,
      status: 'active',
    },
  });

  if (!adminCreated) {
    admin.name = 'System Admin';
    admin.password = adminPassword; // Plain text: setting it triggers the changed('password') check
    admin.roleId = adminRole.id;
    admin.status = 'active';
    await admin.save();
    console.log('  ✓ Admin user updated');
  } else {
    console.log('  ✓ Admin user created');
  }

  // ── Custom Developer Admin User ──────────────────────────────────────────────
  const customEmail = 'sarkarabhisek50@gmail.com';
  const customPassword = 'Admin@123';
  const [customUser, customCreated] = await User.findOrCreate({
    where: { email: customEmail },
    defaults: {
      name: 'Dr. Abhisek Sarkar',
      password: customPassword,
      roleId: adminRole.id,
      status: 'active',
    },
  });

  if (!customCreated) {
    customUser.name = 'Dr. Abhisek Sarkar';
    customUser.password = customPassword;
    customUser.roleId = adminRole.id;
    customUser.status = 'active';
    await customUser.save();
    console.log('  ✓ Custom Admin user updated');
  } else {
    console.log('  ✓ Custom Admin user created');
  }

  // ── Student ──────────────────────────────────────────────────────────────────
  const [student, studentCreated] = await User.findOrCreate({
    where: { email: studentEmail },
    defaults: {
      name: 'Demo Student',
      password: studentPassword,
      roleId: studentRole.id,
      status: 'active',
    },
  });

  if (!studentCreated) {
    student.name = 'Demo Student';
    student.password = studentPassword; // Plain text: setting it triggers the changed('password') check
    student.roleId = studentRole.id;
    student.status = 'active';
    await student.save();
    console.log('  ✓ Student user updated');
  } else {
    console.log('  ✓ Student user created');
  }
};

// ─── COURSES ─────────────────────────────────────────────────────────────────────

const seedCourses = async (): Promise<void> => {
  console.log('  Seeding courses...');
  const totalCourses = await Course.count();
  if (totalCourses > 0) {
    console.log(`  ✓ Courses already seeded (${totalCourses} found), skipping`);
    return;
  }

  await Course.bulkCreate([
    {
      courseName: 'Bachelor of Computer Applications',
      courseCode: 'BCA',
      courseType: 'UG',
      slug: 'bachelor-of-computer-applications',
      duration: '3 Years',
      eligibility: '10+2 from recognized board',
      fees: 'As per university norms',
      description:
        'Undergraduate course focused on software and IT foundations, covering programming, databases, networking, and web development.',
      status: 'published',
    },
    {
      courseName: 'Master of Business Administration',
      courseCode: 'MBA',
      courseType: 'PG',
      slug: 'master-of-business-administration',
      duration: '2 Years',
      eligibility: 'Graduation in any discipline',
      fees: 'As per university norms',
      description:
        'Postgraduate course focused on management, leadership, finance, marketing, and business strategy.',
      status: 'published',
    },
    {
      courseName: 'Bachelor of Commerce',
      courseCode: 'B.COM',
      courseType: 'UG',
      slug: 'bachelor-of-commerce',
      duration: '3 Years',
      eligibility: '10+2 with Commerce from recognized board',
      fees: 'As per university norms',
      description:
        'Comprehensive commerce education covering accounting, economics, finance, and business law.',
      status: 'published',
    },
    {
      courseName: 'Bachelor of Arts',
      courseCode: 'BA',
      courseType: 'UG',
      slug: 'bachelor-of-arts',
      duration: '3 Years',
      eligibility: '10+2 from recognized board',
      fees: 'As per university norms',
      description:
        'Liberal arts education with specializations in various humanities and social science disciplines.',
      status: 'published',
    },
  ]);

  console.log('  ✓ 4 courses seeded');
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────────

const seedDepartments = async (): Promise<void> => {
  console.log('  Seeding departments...');
  // Force clean re-seed
  await Department.destroy({ where: {}, force: true });

  await Department.bulkCreate([
    {
      name: 'Department of Computer Science & IT',
      slug: 'computer-science-it',
      description: 'Focused on computing, software development, data science, and theoretical foundations of computer systems.',
      status: 'active',
    },
    {
      name: 'Department of Business Administration',
      slug: 'business-administration',
      description: 'Nurturing business leaders through modern management frameworks, business strategy, finance, and marketing practices.',
      status: 'active',
    },
    {
      name: 'Department of Commerce',
      slug: 'commerce',
      description: 'Comprehensive financial, commerce, and accounting curriculum enabling corporate and entrepreneurial success.',
      status: 'active',
    },
  ]);
  console.log('  ✓ 3 departments seeded');
};

// ─── FACULTY ─────────────────────────────────────────────────────────────────────

const seedFaculty = async (): Promise<void> => {
  console.log('  Seeding faculty members...');
  // Force clean re-seed
  await Faculty.destroy({ where: {}, force: true });

  const csDept = await Department.findOne({ where: { slug: 'computer-science-it' } });
  const bizDept = await Department.findOne({ where: { slug: 'business-administration' } });

  await Faculty.bulkCreate([
    {
      name: 'Dr. Abhisek Sarkar',
      departmentId: csDept ? csDept.id : null,
      designation: 'Head of Department & Professor',
      qualification: 'Ph.D. in Computer Science & Engineering (AI Focus), M.Tech',
      experience: '15 Years',
      email: 'abhisek.sarkar@eiilm.edu',
      phone: '+91 98765 43210',
      bio: 'Leading research in machine learning, cloud-native enterprise design patterns, and agentic AI models.',
      status: 'active',
      sortOrder: 1,
    },
    {
      name: 'Prof. Rajesh Sharma',
      departmentId: bizDept ? bizDept.id : null,
      designation: 'Associate Professor',
      qualification: 'MBA in Finance & Strategy, UGC NET Qualified',
      experience: '10 Years',
      email: 'rajesh.sharma@eiilm.edu',
      phone: '+91 87654 32109',
      bio: 'Corporate strategist and academic focusing on portfolio management, equity research, and leadership dynamics.',
      status: 'active',
      sortOrder: 2,
    },
  ]);
  console.log('  ✓ 2 faculty members seeded');
};

// ─── NOTICES ─────────────────────────────────────────────────────────────────────

const seedNotices = async (): Promise<void> => {
  console.log('  Seeding notices...');
  // Force clean re-seed
  await Notice.destroy({ where: {}, force: true });

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  await Notice.bulkCreate([
    {
      title: 'Admission Open for BCA and MBA 2026-2027',
      description: 'Online and offline applications are officially open for BCA, MBA, B.Com, and BA courses. Fill in the form via Admissions tab or visit the campus.',
      priority: 'high',
      status: 'published',
      publishDate: today,
      expiryDate: nextWeek,
    },
    {
      title: 'End Semester Exam Schedule Released',
      description: 'The end-semester exam routines have been published for all departments. Download the PDFs from the student portal or department notice boards.',
      priority: 'medium',
      status: 'published',
      publishDate: today,
      expiryDate: nextWeek,
    },
    {
      title: 'Annual Tech Summit "HackSpire 2026" Registrations Open',
      description: 'Register now to participate in our annual hackathon and technology presentation meet. Prizes up to INR 2,0,000 to be won.',
      priority: 'low',
      status: 'published',
      publishDate: today,
      expiryDate: nextWeek,
    },
  ]);
  console.log('  ✓ 3 notices seeded');
};

// ─── EVENTS ──────────────────────────────────────────────────────────────────────

const seedEvents = async (): Promise<void> => {
  console.log('  Seeding events...');
  // Force clean re-seed
  await Event.destroy({ where: {}, force: true });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(tomorrow.getDate() + 7);

  await Event.bulkCreate([
    {
      title: 'TechFest 2026 — Annual Technology Exhibition',
      description: 'Showcasing innovative student projects, programming challenges, robot wars, and coding marathons. Open for external college registrations.',
      banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
      startDate: tomorrow,
      endDate: tomorrow,
      location: 'Main Auditorium & CS Labs',
      registrationLink: 'https://techfest.eiilm.edu',
      status: 'published',
    },
    {
      title: 'National Seminar on Artificial Intelligence & SaaS Architecture',
      description: 'A prestigious forum discussing modern agentic patterns, enterprise database sharding, and SaaS multi-tenancy. Keynotes by leading global architects.',
      banner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
      startDate: nextWeek,
      endDate: nextWeek,
      location: 'Seminar Conference Hall',
      registrationLink: 'https://seminar.eiilm.edu',
      status: 'published',
    },
  ]);
  console.log('  ✓ 2 events seeded');
};

// ─── SITE SETTINGS ────────────────────────────────────────────────────────────────

const seedSiteSettings = async (): Promise<void> => {
  console.log('  Seeding site settings...');
  // Force clean re-seed
  await SiteSetting.destroy({ where: {} });

  await SiteSetting.bulkCreate([
    { keyName: 'college_name', value: 'EIILM College', description: 'Institutional name shown in headers and footers' },
    { keyName: 'short_name', value: 'EIILM', description: 'Short/acronym college name' },
    { keyName: 'email', value: 'info@eiilm.edu', description: 'Official contact email' },
    { keyName: 'phone', value: '+91 376 2342 123', description: 'Official contact number' },
    { keyName: 'address', value: 'College Campus, Near NH-17, Jorhat, Assam', description: 'Physical address of the college' },
    { keyName: 'tagline', value: 'Excellence in Higher Education', description: 'Official college tagline' },
    { keyName: 'about', value: 'A premier institution committed to academic excellence, innovation, and holistic development of every student.', description: 'Brief description about college' },
    { keyName: 'stat_years', value: '25+', description: 'Years of academic excellence' },
    { keyName: 'stat_students', value: '5000+', description: 'Total active student enrollments' },
    { keyName: 'stat_faculty', value: '200+', description: 'Experienced faculty base' },
    { keyName: 'stat_courses', value: '50+', description: 'Total academic courses and diplomas' },
  ]);
  console.log('  ✓ 11 site settings seeded');
};

// ─── PAGE SECTIONS ────────────────────────────────────────────────────────────────

const seedPageSections = async (): Promise<void> => {
  console.log('  Seeding home page sections...');
  // Force clean re-seed
  await PageSection.destroy({ where: {} });

  await PageSection.bulkCreate([
    {
      pageKey: 'home',
      sectionKey: 'hero',
      sortOrder: 1,
      status: 'active',
      config: {
        badge: '✨ ADMISSIONS OPEN FOR 2026-27',
        heading: 'Nurturing Leaders, Inspiring Innovators',
        subheading: 'Join EIILM College, a highly recognized premium institution driving elite academic programs, dynamic industry networks, and state-of-the-art facilities.',
        primaryCta: { label: 'Apply Now', href: '/admissions' },
        secondaryCta: { label: 'Explore Courses', href: '/courses' },
      },
    },
    {
      pageKey: 'home',
      sectionKey: 'stats',
      sortOrder: 2,
      status: 'active',
      config: {
        stats: [
          { label: 'Years of Excellence', value: '25+' },
          { label: 'Students Enrolled', value: '5000+' },
          { label: 'Faculty Members', value: '200+' },
          { label: 'Courses Offered', value: '50+' },
        ],
      },
    },
    {
      pageKey: 'home',
      sectionKey: 'features',
      sortOrder: 3,
      status: 'active',
      config: {
        heading: 'Why Shape Your Future At EIILM?',
        features: [
          { title: 'Academic Excellence', desc: 'World-class curricula and mentorship led by industry authorities and PhD scholars.', icon: '🎓' },
          { title: 'Corporate Connect', desc: 'Robust alignment with tech and finance leaders for internship and job opportunities.', icon: '🤝' },
          { title: 'State-of-the-art Labs', desc: 'Premium computer and research facilities matching globally leading standard institutes.', icon: '⚡' },
        ],
      },
    },
    {
      pageKey: 'home',
      sectionKey: 'notices_list',
      sortOrder: 4,
      status: 'active',
      config: {},
    },
    {
      pageKey: 'home',
      sectionKey: 'events_list',
      sortOrder: 5,
      status: 'active',
      config: {},
    },
    {
      pageKey: 'home',
      sectionKey: 'cta',
      sortOrder: 6,
      status: 'active',
      config: {
        heading: 'Your Bright Future Starts Here',
        subheading: 'Take the first step towards a rewarding and successful global career. Application slots are filling fast.',
        cta: { label: 'Start Application', href: '/admissions' },
      },
    },
  ]);
  console.log('  ✓ 6 home page sections seeded');
};

// ─── RUNNER ──────────────────────────────────────────────────────────────────────

const run = async () => {
  try {
    await Database.authenticate();
    console.log('✓ Database connected\n');

    console.log('Running seed operations:');
    await seedRoles();
    await seedUsers();
    await seedCourses();
    await seedDepartments();
    await seedFaculty();
    await seedNotices();
    await seedEvents();
    await seedSiteSettings();
    await seedPageSections();

    console.log('\n✅ Seed completed successfully.');
    console.log('\nTest credentials:');
    console.log('  Admin   → admin@eiilm.edu   / Admin@123');
    console.log('  Student → student@eiilm.edu / Student@123');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exitCode = 1;
  } finally {
    try {
      await Database.getInstance().close();
    } catch (_) {
      // ignore close errors
    }
  }
};

run();

