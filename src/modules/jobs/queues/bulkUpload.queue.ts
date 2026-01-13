import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!);

const bulkUploadQueue = new Queue("bulk-upload", { connection });

export default bulkUploadQueue;
