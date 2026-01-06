import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

const bulkUserQueue = new Queue("bulk-user-upload", { connection });

export default bulkUserQueue;
