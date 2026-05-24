import dotenv from 'dotenv';
import { Database } from '@config/database';
import '@models/index';
import { Role } from '@models/Role';
import { User } from '@models/User';
import { Course } from '@models/Course';

dotenv.config();

const rolesToSeed = [
  { name: 'super_admin', description: 'Platform super administrator' },
  { name: 'admin', description: 'College administrator' },
  { name: 'student', description: 'Student user' },
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
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  const studentRole = await Role.findOne({ where: { name: 'student' } });

  if (!adminRole || !studentRole) {
    throw new Error('Roles not found. Role seeding failed.');
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@eiilm.edu';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const studentEmail = process.env.SEED_STUDENT_EMAIL || 'student@eiilm.edu';
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'Student@123';

  const admin = await User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      roleId: adminRole.id,
      status: 'active',
    });
  }

  const student = await User.findOne({ where: { email: studentEmail } });
  if (!student) {
    await User.create({
      name: 'Demo Student',
      email: studentEmail,
      password: studentPassword,
      roleId: studentRole.id,
      status: 'active',
    });
  }
};

const seedCourses = async (): Promise<void> => {
  const totalCourses = await Course.count();
  if (totalCourses > 0) {
    return;
  }

  await Course.bulkCreate([
    {
      courseName: 'Bachelor of Computer Applications',
      courseCode: 'BCA',
      courseType: 'UG',
      slug: `bca-${Date.now()}`,
      duration: '3 Years',
      eligibility: '10+2 from recognized board',
      fees: 'As per university norms',
      description: 'Undergraduate course focused on software and IT foundations.',
      status: 'published',
    },
    {
      courseName: 'Master of Business Administration',
      courseCode: 'MBA',
      courseType: 'PG',
      slug: `mba-${Date.now()}`,
      duration: '2 Years',
      eligibility: 'Graduation in any discipline',
      fees: 'As per university norms',
      description: 'Postgraduate course focused on management and leadership.',
      status: 'published',
    },
  ]);
};

const run = async () => {
  try {
    await Database.authenticate();
    console.log('Connected to database.');

    await seedRoles();
    await seedUsers();
    await seedCourses();

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await Database.getInstance().close();
  }
};

run();
