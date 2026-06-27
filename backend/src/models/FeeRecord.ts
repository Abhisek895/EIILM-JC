import { DataTypes, Model } from 'sequelize';
import { Database } from '../config/database';

class FeeRecord extends Model {
  public id!: number;
  public student_id!: number;
  public title!: string;
  public amount!: number;
  public due_date!: Date;
  public status!: 'Paid' | 'Pending' | 'Overdue';
  public receipt_url!: string | null;
}

const db = Database.getInstance();

FeeRecord.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Paid', 'Pending', 'Overdue'),
      defaultValue: 'Pending',
    },
    receipt_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'fee_records',
    timestamps: true,
    underscored: true,
  }
);

export { FeeRecord };
