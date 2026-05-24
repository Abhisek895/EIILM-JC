import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class Course extends Model {
  public id!: number;
  public courseName!: string;
  public courseCode?: string;
  public courseType!: 'UG' | 'PG' | 'Diploma' | 'Certificate';
  public slug!: string;
  public duration?: string;
  public eligibility?: string;
  public fees?: string;
  public description?: string;
  public status!: 'draft' | 'published' | 'archived';
}

const db = Database.getInstance();

Course.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    courseName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    courseCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    courseType: {
      type: DataTypes.ENUM('UG', 'PG', 'Diploma', 'Certificate'),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
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
  }
);

export { Course };
