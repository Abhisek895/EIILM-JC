import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface SpecializationAttributes {
  id: number;
  courseId: number;
  specializationName: string;
  description: string | null;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

type SpecializationCreationAttributes = Optional<
  SpecializationAttributes,
  'id' | 'description' | 'status'
>;

class Specialization
  extends Model<SpecializationAttributes, SpecializationCreationAttributes>
  implements SpecializationAttributes
{
  public id!: number;
  public courseId!: number;
  public specializationName!: string;
  public description!: string | null;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Specialization.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'course_id',
    },
    specializationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'specialization_name',
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'specializations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { Specialization };
