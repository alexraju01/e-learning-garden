const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from server!!');
});

// ANSI Escape Codes:
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `${CYAN}Server listening on http://localhost:${YELLOW}${port}${RESET}`,
  );
});
