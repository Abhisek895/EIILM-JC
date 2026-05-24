import { User } from './User';
import { Course } from './Course';
import { Role } from './Role';
import { Inquiry } from './Inquiry';

Role.hasMany(User, {
  foreignKey: 'roleId',
  sourceKey: 'id',
  as: 'users',
});

User.belongsTo(Role, {
  foreignKey: 'roleId',
  targetKey: 'id',
  as: 'role',
});

export { User, Course, Role, Inquiry };
