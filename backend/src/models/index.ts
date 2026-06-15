/**
 * models/index.ts — SINGLE SOURCE OF TRUTH
 *
 * ALL Sequelize models must be imported here. ALL associations must be
 * defined here. Always import `from '@models/index'` — never from
 * individual model files — to guarantee associations are registered
 * before any query runs.
 */

import { User } from './User';
import { Role } from './Role';
import { Course } from './Course';
import { Specialization } from './Specialization';
import { Inquiry } from './Inquiry';
import { Department } from './Department';
import { Faculty } from './Faculty';
import { Notice } from './Notice';
import { Event } from './Event';
import { SiteSetting } from './SiteSetting';
import { PageSection } from './PageSection';
import { MediaLibrary } from './MediaLibrary';
import { AuditLog } from './AuditLog';
import { Infrastructure } from './Infrastructure';
import { Placement } from './Placement';

// ─── ASSOCIATIONS ──────────────────────────────────────────────────────────────

// Role ↔ User
Role.hasMany(User, { foreignKey: 'roleId', sourceKey: 'id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', targetKey: 'id', as: 'role' });

// Course ↔ Specialization
Course.hasMany(Specialization, {
  foreignKey: 'courseId',
  sourceKey: 'id',
  as: 'specializations',
});
Specialization.belongsTo(Course, {
  foreignKey: 'courseId',
  targetKey: 'id',
  as: 'course',
});

// Department ↔ Faculty
Department.hasMany(Faculty, {
  foreignKey: 'departmentId',
  sourceKey: 'id',
  as: 'faculty',
});
Faculty.belongsTo(Department, {
  foreignKey: 'departmentId',
  targetKey: 'id',
  as: 'department',
});

// MediaLibrary → User (uploadedBy)
User.hasMany(MediaLibrary, {
  foreignKey: 'uploadedBy',
  sourceKey: 'id',
  as: 'uploads',
});
MediaLibrary.belongsTo(User, {
  foreignKey: 'uploadedBy',
  targetKey: 'id',
  as: 'uploader',
});

// AuditLog → User
User.hasMany(AuditLog, { foreignKey: 'userId', sourceKey: 'id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });

// Inquiry → Course
Course.hasMany(Inquiry, { foreignKey: 'courseId', sourceKey: 'id', as: 'inquiries' });
Inquiry.belongsTo(Course, { foreignKey: 'courseId', targetKey: 'id', as: 'course' });

// ─── EXPORTS ───────────────────────────────────────────────────────────────────
export {
  User,
  Role,
  Course,
  Specialization,
  Inquiry,
  Department,
  Faculty,
  Notice,
  Event,
  SiteSetting,
  PageSection,
  MediaLibrary,
  AuditLog,
  Infrastructure,
  Placement,
};
