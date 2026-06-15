import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface PageSectionAttributes {
  id: number;
  tenantId: number | null;
  pageKey: string;
  sectionKey: string;
  sortOrder: number;
  config: object | null;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

type PageSectionCreationAttributes = Optional<
  PageSectionAttributes,
  'id' | 'tenantId' | 'sortOrder' | 'config' | 'status'
>;

class PageSection
  extends Model<PageSectionAttributes, PageSectionCreationAttributes>
  implements PageSectionAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public pageKey!: string;
  public sectionKey!: string;
  public sortOrder!: number;
  public config!: object | null;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PageSection.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    pageKey: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'page_key',
    },
    sectionKey: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'section_key',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'page_sections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { PageSection };
