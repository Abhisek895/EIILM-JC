import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Sequelize;

  static getInstance(): Sequelize {
    if (!Database.instance) {
      const postgresUri =
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_URL ||
        process.env.STORAGE_URL ||
        process.env.STORAGE_PRISMA_URL;

      if (postgresUri || process.env.DB_DIALECT === 'postgres') {
        const uri = postgresUri || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;
        Database.instance = new Sequelize(uri, {
          dialect: 'postgres',
          dialectOptions: {
            ssl: process.env.DB_SSL === 'false' ? false : {
              require: true,
              rejectUnauthorized: false,
            },
          },
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        });
      } else {
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
