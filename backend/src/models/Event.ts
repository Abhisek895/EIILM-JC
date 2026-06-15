import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface EventAttributes {
  id: number;
  tenantId: number | null;
  title: string;
  description: string | null;
  banner: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  registrationLink: string | null;
  status: 'draft' | 'published' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type EventCreationAttributes = Optional<
  EventAttributes,
  | 'id'
  | 'tenantId'
  | 'description'
  | 'banner'
  | 'startDate'
  | 'endDate'
  | 'location'
  | 'registrationLink'
  | 'status'
  | 'deletedAt'
>;

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public title!: string;
  public description!: string | null;
  public banner!: string | null;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public location!: string | null;
  public registrationLink!: string | null;
  public status!: 'draft' | 'published' | 'completed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Event.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    banner: { type: DataTypes.STRING(512), allowNull: true },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date',
    },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
    location: { type: DataTypes.STRING(255), allowNull: true },
    registrationLink: {
      type: DataTypes.STRING(512),
      allowNull: true,
      field: 'registration_link',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'completed'),
      defaultValue: 'draft',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'events',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
  }
);

export { Event };
