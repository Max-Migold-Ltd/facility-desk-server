import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import csvtojson from "csvtojson";

import { AuthService } from "../../auth/auth.service";
import {
  SitesService,
  ComplexesService,
  BuildingsService,
  FloorsService,
  SpacesService,
  ZonesService,
} from "../../location";

import { AppError } from "../../../errors";

const authService = new AuthService();
const siteService = new SitesService();
const complexService = new ComplexesService();
const buildingService = new BuildingsService();
const floorService = new FloorsService();
const spaceService = new SpacesService();
const zoneService = new ZonesService();

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const BATCH_SIZE = 50;

// Extract data to rows
const extractData = async (filePath: string) => {
  if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      blankrows: false,
    });
    return rows;
  } else if (filePath.endsWith(".csv")) {
    const csv = await csvtojson().fromFile(filePath);
    return csv;
  } else if (filePath.endsWith(".json")) {
    const json = await fs.readFile(filePath, "utf-8");
    return JSON.parse(json);
  }
};

const worker = new Worker(
  "bulk-upload",
  async (job) => {
    const { filePath } = job.data;

    if (
      !filePath.endsWith(".xlsx") &&
      !filePath.endsWith(".xls") &&
      !filePath.endsWith(".csv") &&
      !filePath.endsWith(".json")
    ) {
      return new AppError(
        "Unsupported file type",
        400,
        "UNSUPPORTED_FILE_TYPE"
      );
    }
    switch (job.name) {
      case "process-users":
        try {
          const data = await extractData(filePath);

          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                authService.register(row).catch((err) => {
                  console.error("Row failed:", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }
        break;
      case "process-sites":
        try {
          const data = await extractData(filePath);

          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                siteService.create(row).catch((err) => {
                  console.error("Row failed: ", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }
      case "process-complexes":
        try {
          const data = await extractData(filePath);
          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                complexService.create(row).catch((err) => {
                  console.error("Row failed: ", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }
      case "process-buildings":
        try {
          const data = await extractData(filePath);
          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                buildingService.create(row).catch((err) => {
                  console.error("Row failed: ", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }
      case "process-floors":
        try {
          const data = await extractData(filePath);
          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                floorService.create(row).catch((err) => {
                  console.error("Row failed: ", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }

      case "process-spaces":
        try {
          const data = await extractData(filePath);
          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                spaceService.create(row).catch((err) => {
                  console.error("Row failed: ", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }
      case "process-zones":
        try {
          const data = await extractData(filePath);
          for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((row: any) =>
                zoneService.create(row).catch((err) => {
                  console.error("Row failed: ", row.email, err.message);
                })
              )
            );
          }
        } catch (error) {
          console.error("Error processing users:", error);
        } finally {
          await fs.unlink(filePath);
        }
      default:
        break;
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
