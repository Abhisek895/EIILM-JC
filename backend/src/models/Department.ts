import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface DepartmentAttributes {
  id: number;
  tenantId: number | null;
  name: string;
  slug: string | null;
  description: string | null;
  hodId: number | null;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type DepartmentCreationAttributes = Optional<
  DepartmentAttributes,
  'id' | 'tenantId' | 'slug' | 'description' | 'hodId' | 'status' | 'deletedAt'
>;

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public name!: string;
  public slug!: string | null;
  public description!: string | null;
  public hodId!: number | null;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations (populated by Sequelize when included)
  public faculty?: any[];
}

Department.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    name: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), unique: true, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    hodId: { type: DataTypes.BIGINT, allowNull: true, field: 'hod_id' },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'departments',
    timestamps: true,
    paranoid: true, // soft delete
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
  }
);

export { Department };
