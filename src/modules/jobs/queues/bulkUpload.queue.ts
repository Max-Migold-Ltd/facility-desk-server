import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_URL!
    : "redis://localhost:6379",
  { maxRetriesPerRequest: null },
);

const bulkUploadQueue = new Queue("bulk-upload", { connection });

export default bulkUploadQueue;
