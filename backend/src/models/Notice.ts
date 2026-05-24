import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface NoticeAttributes {
  id: number;
  tenantId: number | null;
  title: string;
  description: string | null;
  pdfUrl: string | null;
  publishDate: Date | null;
  expiryDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'expired';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type NoticeCreationAttributes = Optional<
  NoticeAttributes,
  | 'id'
  | 'tenantId'
  | 'description'
  | 'pdfUrl'
  | 'publishDate'
  | 'expiryDate'
  | 'priority'
  | 'status'
  | 'deletedAt'
>;

class Notice
  extends Model<NoticeAttributes, NoticeCreationAttributes>
  implements NoticeAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public title!: string;
  public description!: string | null;
  public pdfUrl!: string | null;
  public publishDate!: Date | null;
  public expiryDate!: Date | null;
  public priority!: 'low' | 'medium' | 'high';
  public status!: 'draft' | 'published' | 'expired';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Notice.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    pdfUrl: { type: DataTypes.STRING(512), allowNull: true, field: 'pdf_url' },
    publishDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'publish_date',
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'expiry_date',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'expired'),
      defaultValue: 'draft',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'notices',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
  }
);

export { Notice };
