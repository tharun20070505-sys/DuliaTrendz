import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

let currentPort = Number(process.env.PORT) || 5001;

// Connect to Turso Database & Start Server
const startServer = async () => {
  try {
    await connectDB();

    const listenOnPort = (portToTry) => {
      const server = app.listen(portToTry, () => {
        console.log(`\n======================================================`);
        console.log(`  DULIA TRENDZ API SERVER RUNNING`);
        console.log(`  Port: ${portToTry}`);
        console.log(`  URL: http://localhost:${portToTry}`);
        console.log(`  Health: http://localhost:${portToTry}/api/health`);
        console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`======================================================\n`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${portToTry} is in use (often Apple AirPlay on macOS), attempting port ${portToTry + 1}...`);
          listenOnPort(portToTry + 1);
        } else {
          console.error(`Server error:`, err);
        }
      });
    };

    listenOnPort(currentPort);

    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Error: ${err.message}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
