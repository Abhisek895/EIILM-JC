import { Model, DataTypes } from 'sequelize';
import { Database } from '../config/database';

const sequelize = Database.getInstance();

export class ChatMessage extends Model {
  public id!: number;
  public session_id!: string;
  public role!: 'user' | 'assistant' | 'system';
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    timestamps: true,
  }
);
