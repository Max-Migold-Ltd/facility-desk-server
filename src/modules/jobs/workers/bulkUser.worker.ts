import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import { AuthService } from "../../auth/auth.service";

const authService = new AuthService();
const connection = new IORedis({ maxRetriesPerRequest: null });

const worker = new Worker(
  "bulk-user-upload",
  async (job) => {
    const { filePath } = job.data;

    if (!filePath.endsWith(".xlsx") && !filePath.endsWith(".xls")) {
      throw new Error("Unsupported file type");
    }

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // console.log("Sheet Name", sheetName);
      // console.log("Worksheet", worksheet);

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        blankrows: false,
      });

      console.log("Rows: ", rows);

      const BATCH_SIZE = 50;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map((row: any) =>
            authService.register(row).catch((err) => {
              console.error("Row failed:", row.email, err.message);
            })
          )
        );
      }
    } finally {
      await fs.unlink(filePath);
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log("Job completed");
});

worker.on("failed", (job) => {
  console.log("Job failed");
});
