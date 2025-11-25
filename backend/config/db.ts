require('dotenv').config({ quiet: true });

import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  ssl: false,
  dialectOptions: {
    clientMinMessages: 'notice',
  },
});
