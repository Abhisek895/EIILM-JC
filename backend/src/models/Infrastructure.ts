import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface InfrastructureAttributes {
  id: number;
  tenantId: number | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  icon: string | null;
  category: 'facility' | 'tour' | 'campus_highlight' | 'hero';
  status: 'active' | 'inactive' | 'maintenance';
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type InfrastructureCreationAttributes = Optional<
  InfrastructureAttributes,
  | 'id'
  | 'tenantId'
  | 'description'
  | 'imageUrl'
  | 'videoUrl'
  | 'icon'
  | 'category'
  | 'status'
  | 'sortOrder'
  | 'deletedAt'
>;

class Infrastructure
  extends Model<InfrastructureAttributes, InfrastructureCreationAttributes>
  implements InfrastructureAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public title!: string;
  public description!: string | null;
  public imageUrl!: string | null;
  public videoUrl!: string | null;
  public icon!: string | null;
  public category!: 'facility' | 'tour' | 'campus_highlight' | 'hero';
  public status!: 'active' | 'inactive' | 'maintenance';
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Infrastructure.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'tenant_id',
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.STRING(512), allowNull: true, field: 'image_url' },
    videoUrl: { type: DataTypes.STRING(512), allowNull: true, field: 'video_url' },
    icon: { type: DataTypes.STRING(50), allowNull: true },
    category: {
      type: DataTypes.ENUM('facility', 'tour', 'campus_highlight', 'hero'),
      defaultValue: 'facility',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      defaultValue: 'active',
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'infrastructures',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
  }
);

export { Infrastructure };
