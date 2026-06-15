import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface FacultyAttributes {
  id: number;
  departmentId: number | null;
  name: string;
  designation: string | null;
  photo: string | null;
  qualification: string | null;
  experience: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type FacultyCreationAttributes = Optional<
  FacultyAttributes,
  | 'id'
  | 'departmentId'
  | 'designation'
  | 'photo'
  | 'qualification'
  | 'experience'
  | 'email'
  | 'phone'
  | 'bio'
  | 'status'
  | 'sortOrder'
  | 'deletedAt'
>;

class Faculty
  extends Model<FacultyAttributes, FacultyCreationAttributes>
  implements FacultyAttributes
{
  public id!: number;
  public departmentId!: number | null;
  public name!: string;
  public designation!: string | null;
  public photo!: string | null;
  public qualification!: string | null;
  public experience!: string | null;
  public email!: string | null;
  public phone!: string | null;
  public bio!: string | null;
  public status!: 'active' | 'inactive';
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Populated via association
  public department?: any;
}

Faculty.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    departmentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'department_id',
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    designation: { type: DataTypes.STRING(255), allowNull: true },
    photo: { type: DataTypes.STRING(512), allowNull: true },
    qualification: { type: DataTypes.TEXT, allowNull: true },
    experience: { type: DataTypes.STRING(255), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(100), allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'faculty',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
  }
);

export { Faculty };
