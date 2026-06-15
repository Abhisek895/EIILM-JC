import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class Placement extends Model {
  public id!: number;
  public tenantId!: number | null;
  public studentName!: string;
  public companyName!: string;
  public companyLogo?: string;
  public package!: string;
  public year!: string;
  public course?: string;
  public studentImage?: string;
  public placementType!: 'placement' | 'internship';
  public status!: 'draft' | 'published' | 'archived';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const db = Database.getInstance();

Placement.init(
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
    studentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'student_name',
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
    },
    companyLogo: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: 'company_logo',
    },
    package: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    studentImage: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: 'student_image',
    },
    placementType: {
      type: DataTypes.ENUM('placement', 'internship'),
      defaultValue: 'placement',
      field: 'placement_type',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
  },
  {
    sequelize: db,
    tableName: 'placements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { Placement };
