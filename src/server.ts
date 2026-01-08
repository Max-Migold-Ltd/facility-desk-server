import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { CONSTANTS } from "./config/constants";
import { initPreventiveScheduler } from "./modules/jobs/preventive.scheduler";
import "./modules/jobs/workers/bulkUser.worker";

let server: any;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Cron Jobs
    // initPreventiveScheduler();

    // Start Express server
    server = app.listen(CONSTANTS.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║   Facility Desk Server                                ║
║   Port: ${CONSTANTS.PORT}                                        ║
║   Environment: ${CONSTANTS.NODE_ENV}                           ║
║   API Version: ${CONSTANTS.API_VERSION}                                   ║
╚═══════════════════════════════════════════════════════╝
      `);
      console.log(`✓ Server is running at http://localhost:${CONSTANTS.PORT}`);
      console.log(`✓ Health check: http://localhost:${CONSTANTS.PORT}/health`);
      console.log(
        `✓ API Base URL: http://localhost:${CONSTANTS.PORT}/api/${CONSTANTS.API_VERSION}`
      );
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function shutdown(signal: string) {
  console.log(`\n${signal} received, closing server gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("✓ HTTP server closed");
      await disconnectDatabase();
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("✗ Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("✗ UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("✗ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(1);
  });
});

// Handle graceful shutdown signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start the server
startServer();
