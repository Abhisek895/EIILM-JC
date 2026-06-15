import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class Inquiry extends Model {
  public id!: number;
  public tenantId!: number | null;
  public fullName!: string;
  public phone!: string | null;
  public email!: string | null;
  public courseId!: number | null;
  public specializationId!: number | null;
  public city!: string | null;
  public message!: string | null;
  public source!: string | null;
  public status!:
    | 'new'
    | 'contacted'
    | 'interested'
    | 'follow_up'
    | 'converted'
    | 'rejected'
    | 'closed';
  public assignedTo!: number | null;
  public followupDate!: Date | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const db = Database.getInstance();

Inquiry.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    tenantId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'tenant_id',
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'course_id',
    },
    specializationId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'specialization_id',
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'new',
        'contacted',
        'interested',
        'follow_up',
        'converted',
        'rejected',
        'closed'
      ),
      defaultValue: 'new',
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'assigned_to',
    },
    followupDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'followup_date',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'inquiries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { Inquiry };
