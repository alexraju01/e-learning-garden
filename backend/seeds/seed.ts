import { sequelize } from '../config/db';
import { GREEN, RED, RESET } from '../lib/colours';
import Task from '../models/task.model';
import User from '../models/user.model';

const tasksData = require('./tasks.seed.json');
const usersData = require('./users.seed.json');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });

    await User.bulkCreate(usersData);
    console.log(`${GREEN} Users seeded Successfully!${RESET}`);
    await Task.bulkCreate(tasksData);
    console.log(`${GREEN}Task seeded Successfully!${RESET}`);

    // 5. Exit the process
    process.exit(0); // Use code 0 for a successful exit
  } catch (error) {
    console.error(`${RED}Database seeding failed:${RESET}`, error);
    process.exit(1); // Use code 1 for an error exit
  }
};

seedDatabase();
