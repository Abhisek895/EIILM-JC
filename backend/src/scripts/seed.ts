import dotenv from 'dotenv';
import { Database } from '@config/database';
import '@models/index';
import { Role } from '@models/Role';
import { User } from '@models/User';
import { Course } from '@models/Course';
import { Department } from '@models/Department';
import { ChatKnowledgeBase } from '@models/ChatKnowledgeBase';

dotenv.config();

const rolesToSeed = [
  { name: 'super_admin', description: 'Platform super administrator with full system authority' },
  { name: 'admin', description: 'College administrator' },
  { name: 'faculty', description: 'Faculty member / lecturer' },
  { name: 'student', description: 'Enrolled student user' },
];

const seedRoles = async (): Promise<void> => {
  for (const role of rolesToSeed) {
    await Role.findOrCreate({
      where: { name: role.name },
      defaults: role,
    });
  }
};

const seedUsers = async (): Promise<void> => {
  const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  const facultyRole = await Role.findOne({ where: { name: 'faculty' } });
  const studentRole = await Role.findOne({ where: { name: 'student' } });

  if (!superAdminRole || !adminRole || !facultyRole || !studentRole) {
    throw new Error('Roles not found. Role seeding failed.');
  }

  const users = [
    {
      name: 'Super Admin',
      email: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@eiilm.edu',
      password: process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123',
      roleId: superAdminRole.id,
      permissions: {
        canManageRbac: true,
        modules: {
          dashboard: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
          courses: ['read', 'write', 'delete'],
          departments: ['read', 'write', 'delete'],
          faculty: ['read', 'write', 'delete'],
          inquiries: ['read', 'write', 'delete'],
          notices: ['read', 'write', 'delete'],
          events: ['read', 'write', 'delete'],
          media: ['read', 'write', 'delete'],
          infrastructures: ['read', 'write', 'delete'],
          placements: ['read', 'write', 'delete'],
          site_settings: ['read', 'write', 'delete'],
          analytics: ['read'],
        },
      },
    },
    {
      name: 'System Admin',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@eiilm.edu',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
      roleId: adminRole.id,
      permissions: {
        canManageRbac: false,
        modules: {
          dashboard: ['read', 'write'],
          users: ['read', 'write'],
          courses: ['read', 'write', 'delete'],
          departments: ['read', 'write'],
          faculty: ['read', 'write'],
          inquiries: ['read', 'write', 'delete'],
          notices: ['read', 'write', 'delete'],
          events: ['read', 'write', 'delete'],
          media: ['read', 'write', 'delete'],
          infrastructures: ['read', 'write'],
          placements: ['read', 'write'],
        },
      },
    },
    {
      name: 'Prof. Anirban Roy',
      email: process.env.SEED_FACULTY_EMAIL || 'faculty@eiilm.edu',
      password: process.env.SEED_FACULTY_PASSWORD || 'Faculty@123',
      roleId: facultyRole.id,
      permissions: {
        canManageRbac: false,
        modules: {
          dashboard: ['read'],
          courses: ['read'],
          notices: ['read'],
          events: ['read'],
        },
      },
    },
    {
      name: 'Demo Student',
      email: process.env.SEED_STUDENT_EMAIL || 'student@eiilm.edu',
      password: process.env.SEED_STUDENT_PASSWORD || 'Student@123',
      roleId: studentRole.id,
      permissions: null,
    },
  ];

  for (const u of users) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (!existing) {
      // Pass plain password; User.beforeCreate hook will hash it exactly once
      await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        roleId: u.roleId,
        status: 'active',
        permissions: u.permissions,
      });
      console.log(`Created user: ${u.email}`);
    } else {
      // Re-hash password cleanly to fix any previous double-hashing
      existing.password = u.password;
      existing.roleId = u.roleId;
      existing.status = 'active';
      existing.permissions = u.permissions;
      await existing.save();
      console.log(`Updated user: ${u.email}`);
    }
  }
};

const seedCourses = async (): Promise<void> => {
  const courses = [
    {
      courseName: 'Bachelor of Computer Applications',
      courseCode: 'BCA',
      courseType: 'UG' as const,
      slug: 'bca',
      duration: '3 Years',
      eligibility: '10+2 with Mathematics/Computer Science from recognized board',
      fees: '₹1,20,000 per year',
      description: 'Undergraduate course focused on modern software engineering, cloud computing, and IT foundations.',
      status: 'published' as const,
    },
    {
      courseName: 'Bachelor of Business Administration',
      courseCode: 'BBA',
      courseType: 'UG' as const,
      slug: 'bba',
      duration: '3 Years',
      eligibility: '10+2 from recognized board in any stream',
      fees: '₹1,10,000 per year',
      description: 'Foundational business administration program focusing on marketing, finance, and human resources.',
      status: 'published' as const,
    },
    {
      courseName: 'Master of Business Administration',
      courseCode: 'MBA',
      courseType: 'PG' as const,
      slug: 'mba',
      duration: '2 Years',
      eligibility: 'Graduation in any discipline with minimum 50% aggregate',
      fees: '₹2,50,000 per year',
      description: 'Premier postgraduate program developing managerial leadership, strategic thinking, and corporate entrepreneurship.',
      status: 'published' as const,
    },
    {
      courseName: 'Master of Computer Applications',
      courseCode: 'MCA',
      courseType: 'PG' as const,
      slug: 'mca',
      duration: '2 Years',
      eligibility: 'BCA / B.Sc (IT/CS) with Mathematics at 10+2 or degree level',
      fees: '₹1,50,000 per year',
      description: 'Advanced postgraduate curriculum in software architecture, distributed systems, and AI.',
      status: 'published' as const,
    },
  ];

  for (const c of courses) {
    const existing = await Course.findOne({ where: { slug: c.slug } });
    if (!existing) {
      await Course.create(c);
      console.log(`Created course: ${c.courseName}`);
    }
  }
};

const seedDepartments = async (): Promise<void> => {
  const departments = [
    {
      name: 'Department of Computer Science & Information Technology',
      slug: 'department-of-computer-science',
      code: 'CS-IT',
      description: 'Fostering excellence in computing, algorithms, artificial intelligence, and software craftsmanship.',
      status: 'active' as const,
      sortOrder: 1,
    },
    {
      name: 'Department of Management Studies',
      slug: 'department-of-management-studies',
      code: 'MGMT',
      description: 'Cultivating future business leaders, strategic analysts, and innovative entrepreneurs.',
      status: 'active' as const,
      sortOrder: 2,
    },
    {
      name: 'Department of Media & Mass Communication',
      slug: 'department-of-media-communication',
      code: 'MMC',
      description: 'Empowering media professionals with cutting-edge journalism, digital media, and film techniques.',
      status: 'active' as const,
      sortOrder: 3,
    },
  ];

  for (const d of departments) {
    const existing = await Department.findOne({ where: { slug: d.slug } });
    if (!existing) {
      await Department.create(d);
      console.log(`Created department: ${d.name}`);
    }
  }
};

const seedChatKnowledge = async (): Promise<void> => {
  const count = await ChatKnowledgeBase.count();
  if (count > 0) return;

  const knowledge = [
    {
      category: 'Admissions',
      question: 'What are the admission requirements for BCA?',
      answer: 'Candidates must have passed 10+2 from a recognized board with Mathematics or Computer Science as a subject.',
      keywords: 'bca admission eligibility criteria requirements apply',
      source: 'manual',
    },
    {
      category: 'Admissions',
      question: 'What is the fee structure for MBA?',
      answer: 'The MBA course fee is ₹2,50,000 per year, payable in semester installments. Scholarships are available based on merit.',
      keywords: 'mba fees tuition cost expense installment scholarship',
      source: 'manual',
    },
    {
      category: 'Campus',
      question: 'Where is EIILM Jalpaiguri Campus located?',
      answer: 'EIILM Kolkata Jalpaiguri Campus is located in Jalpaiguri, West Bengal, equipped with modern labs, smart classrooms, and Wi-Fi.',
      keywords: 'location address campus where direction map jalpaiguri',
      source: 'manual',
    },
    {
      category: 'Contact',
      question: 'How can I contact the admissions office?',
      answer: 'You can reach admissions at admissions@eiilm.edu or submit an inquiry form on our website.',
      keywords: 'contact phone email phone admissions office inquiry helpline',
      source: 'manual',
    },
  ];

  await ChatKnowledgeBase.bulkCreate(knowledge);
  console.log('Seeded chatbot knowledge base');
};

const run = async () => {
  try {
    await Database.authenticate();
    console.log('Connected to database.');

    await seedRoles();
    console.log('Roles verified.');
    await seedUsers();
    console.log('Users seeded/verified.');
    await seedCourses();
    console.log('Courses seeded/verified.');
    await seedDepartments();
    console.log('Departments seeded/verified.');
    await seedChatKnowledge();
    console.log('Chat knowledge base seeded/verified.');

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await Database.getInstance().close();
  }
};

run();
