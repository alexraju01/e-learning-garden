import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'e_learning_garden',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
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

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[32m✓ Database connection established successfully.\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m✗ Unable to connect to the database:\x1b[0m', error);
    process.exit(1);
  }
};

export default sequelize;