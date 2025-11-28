import app from './app';
import { sequelize } from './config/db';
import { BLUE, ORANGE, RED, RESET } from './lib/colours';

async function startServer() {
  try {
    console.log(`${BLUE}Connecting to the database...${RESET}`);
    await sequelize.authenticate();
    console.log(`${BLUE}Successfully connected to the database.${RESET}`);

    const { PORT } = process.env;
    app.listen(PORT, () => {
      console.log(`${ORANGE}Server listenings on http://localhost:${PORT}${RESET}`);
    });
  } catch (error) {
    console.error(`${RED}Unable to connect to the database:${RESET}`, error);
    process.exit(1);
  }
}

startServer();
