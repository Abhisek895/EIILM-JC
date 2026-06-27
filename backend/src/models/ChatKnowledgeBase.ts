import { Model, DataTypes } from 'sequelize';
import { Database } from '../config/database';

const sequelize = Database.getInstance();

export class ChatKnowledgeBase extends Model {
  public id!: number;
  public category!: string;
  public question!: string;
  public answer!: string;
  public keywords!: string;
  public status!: 'active' | 'inactive';
  public source!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatKnowledgeBase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General',
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'manual', // can be 'manual' or a document name
    },
  },
  {
    sequelize,
    tableName: 'chat_knowledge_base',
    timestamps: true,
  }
);
