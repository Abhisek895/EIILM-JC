import { Model, DataTypes } from 'sequelize';
import { Database } from '../config/database';

const sequelize = Database.getInstance();

export class ChatSession extends Model {
  public id!: number;
  public session_id!: string;
  public user_ip!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'chat_sessions',
    timestamps: true,
  }
);
