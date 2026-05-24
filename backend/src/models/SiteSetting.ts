import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface SiteSettingAttributes {
  id: number;
  tenantId: number | null;
  keyName: string;
  value: string | null;
  description: string | null;
  updatedAt?: Date;
}

type SiteSettingCreationAttributes = Optional<
  SiteSettingAttributes,
  'id' | 'tenantId' | 'value' | 'description'
>;

class SiteSetting
  extends Model<SiteSettingAttributes, SiteSettingCreationAttributes>
  implements SiteSettingAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public keyName!: string;
  public value!: string | null;
  public description!: string | null;
  public readonly updatedAt!: Date;
}

SiteSetting.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    keyName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'key_name',
    },
    value: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'site_settings',
    timestamps: false,
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { SiteSetting };
