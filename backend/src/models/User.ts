import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';
import bcrypt from 'bcryptjs';

class User extends Model {
  public id!: number;
  public tenantId!: number | null;
  public name!: string;
  public email!: string;
  public password!: string;
  public roleId!: number;
  public status!: 'active' | 'inactive' | 'blocked';
  public lastLogin!: Date | null;
  public otpCode!: string | null;
  public otpExpiresAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public role?: { id: number; name: string; description?: string };

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

const db = Database.getInstance();

User.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'role_id',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      defaultValue: 'active',
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
    },
    otpCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: 'otp_code',
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'otp_expires_at',
    },
  },
  {
    sequelize: db,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export { User };
