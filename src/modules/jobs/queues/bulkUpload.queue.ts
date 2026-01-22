import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

const bulkUploadQueue = new Queue("bulk-upload", { connection });

export default bulkUploadQueue;
