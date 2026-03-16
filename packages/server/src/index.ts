import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { initDatabase } from './db/connection.js';

const PORT = parseInt(process.env.PORT || '3001');

async function main() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
