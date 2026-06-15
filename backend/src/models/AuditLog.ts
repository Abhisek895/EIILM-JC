import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface AuditLogAttributes {
  id: number;
  tenantId: number | null;
  userId: number | null;
  eventType: string;
  module: string | null;
  referenceId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt?: Date;
}

type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  | 'id'
  | 'tenantId'
  | 'userId'
  | 'module'
  | 'referenceId'
  | 'oldValue'
  | 'newValue'
  | 'ipAddress'
  | 'userAgent'
>;

class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public userId!: number | null;
  public eventType!: string;
  public module!: string | null;
  public referenceId!: string | null;
  public oldValue!: string | null;
  public newValue!: string | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    userId: { type: DataTypes.BIGINT, allowNull: true, field: 'user_id' },
    eventType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'event_type',
    },
    module: { type: DataTypes.STRING(100), allowNull: true },
    referenceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'reference_id',
    },
    oldValue: { type: DataTypes.TEXT, allowNull: true, field: 'old_value' },
    newValue: { type: DataTypes.TEXT, allowNull: true, field: 'new_value' },
    ipAddress: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'user_agent',
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
);

export { AuditLog };
