import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { startDuplicateConsumer } from "./events/consumers/duplicateConsumer";

async function start() {
  await AppDataSource.initialize();
  console.log("[WORKER] Database connected");

  await startDuplicateConsumer();
}

start();