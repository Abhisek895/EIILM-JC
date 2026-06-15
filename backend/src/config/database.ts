import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Sequelize;

  static getInstance(): Sequelize {
    if (!Database.instance) {
      Database.instance = new Sequelize(
        process.env.DB_NAME || 'eiilm_college',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'root',
        {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          dialect: 'mysql',
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        }
      );
    }
    return Database.instance;
  }

  static async authenticate(): Promise<void> {
    const sequelize = Database.getInstance();
    await sequelize.authenticate();
  }

  static async sync(force: boolean = false): Promise<void> {
    const sequelize = Database.getInstance();
    await sequelize.sync({ force });
  }
}

export { Database };
