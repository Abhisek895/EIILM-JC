import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class Course extends Model {
  public id!: number;
  public tenantId!: number | null;
  public courseName!: string;
  public courseCode?: string;
  public courseType!: 'UG' | 'PG' | 'Diploma' | 'Certificate';
  public slug!: string | null;
  public duration?: string;
  public eligibility?: string;
  public fees?: string;
  public description?: string;
  public status!: 'draft' | 'published' | 'archived';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const db = Database.getInstance();

Course.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    tenantId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'tenant_id',
    },
    courseName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'course_name',
    },
    courseCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'course_code',
    },
    courseType: {
      type: DataTypes.ENUM('UG', 'PG', 'Diploma', 'Certificate'),
      allowNull: false,
      field: 'course_type',
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    eligibility: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fees: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
  },
  {
    sequelize: db,
    tableName: 'courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { Course };
