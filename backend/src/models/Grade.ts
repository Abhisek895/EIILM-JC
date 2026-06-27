import { DataTypes, Model } from 'sequelize';
import { Database } from '../config/database';

class Grade extends Model {
  public id!: number;
  public student_id!: number;
  public semester!: string;
  public subject!: string;
  public grade!: string;
  public credits!: number;
  public status!: 'Pass' | 'Fail' | 'Pending';
}

const db = Database.getInstance();

Grade.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    semester: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pass', 'Fail', 'Pending'),
      defaultValue: 'Pass',
    },
  },
  {
    sequelize: db,
    tableName: 'grades',
    timestamps: true,
    underscored: true,
  }
);

export { Grade };
