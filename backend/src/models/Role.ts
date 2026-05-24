import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class Role extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
}

const db = Database.getInstance();

Role.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'roles',
    timestamps: false,
  }
);

export { Role };
