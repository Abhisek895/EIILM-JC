import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface PageViewAttributes {
  id: number;
  path: string;
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  createdAt?: Date;
}

type PageViewCreationAttributes = Optional<
  PageViewAttributes,
  'id' | 'userAgent' | 'ipAddress' | 'country' | 'region' | 'city' | 'createdAt'
>;

class PageView
  extends Model<PageViewAttributes, PageViewCreationAttributes>
  implements PageViewAttributes
{
  public id!: number;
  public path!: string;
  public userAgent!: string | null;
  public ipAddress!: string | null;
  public country!: string | null;
  public region!: string | null;
  public city!: string | null;
  public readonly createdAt!: Date;
}

PageView.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    path: { type: DataTypes.STRING(255), allowNull: false },
    userAgent: { type: DataTypes.STRING(255), allowNull: true, field: 'user_agent' },
    ipAddress: { type: DataTypes.STRING(100), allowNull: true, field: 'ip_address' },
    country: { type: DataTypes.STRING(50), allowNull: true },
    region: { type: DataTypes.STRING(100), allowNull: true },
    city: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'page_views',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
);

export { PageView };
