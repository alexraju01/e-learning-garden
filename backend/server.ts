import app from './app';
import { sequelize } from './config/db';

// console.log colour change
const GREEN = '\x1b[32m';
const ORANGE = '\x1b[33m';
const RED = '\x1b[31m';


async function startServer() {
  try {
    console.log(`${ORANGE}Connecting to the database...`);
    await sequelize.authenticate();
    console.log(`${GREEN}Successfully connected to the database.`);

    const { PORT } = process.env;
    app.listen(PORT, () => {
      console.log(`${ORANGE}Server listenings on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`${RED}Unable to connect to the database:`, error);
    process.exit(1);
  }
}

startServer();
