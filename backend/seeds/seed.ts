import { sequelize } from '../config/db';
import Task from '../models/task.model';
import User from '../models/user.model';

// const tasksData = require('./tasks.seed.json');
const usersData = require('./users.seed.json');

// npx ts-node ./seeds/seed.ts
const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log(usersData);
    // 3. Seed Tasks
    // await Task.bulkCreate(tasksData);
    // console.log('🌱 Seeded Tasks Successfully!');
    await User.bulkCreate(usersData);
    console.log('🌱 Seeded Users Successfully!');

    // 5. Exit the process
    process.exit(0); // Use code 0 for a successful exit
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1); // Use code 1 for an error exit
  }
};

seedDatabase();
