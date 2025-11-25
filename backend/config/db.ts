// import { Sequelize } from '@sequelize/core';
// import { PostgresDialect } from '@sequelize/postgres';

import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  database: process.env.DB_NAME,
  // V6 uses 'username' instead of 'user'
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  ssl: false,
  dialectOptions: {
    clientMinMessages: 'notice',
  },
});
