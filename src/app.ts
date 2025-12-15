import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { CONSTANTS } from "./config/constants";
import { errorMiddleware } from "./middleware/error.middleware";
import { apiRateLimiter } from "./middleware/rate-limit.middleware";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import roleRoutes from "./modules/roles/roles.routes";
import permissionRoutes from "./modules/permissions/permissions.routes";
import complexesRoutes from "./modules/sites/routes/complexes.routes";
import buildingsRoutes from "./modules/sites/routes/buildings.routes";
import floorsRoutes from "./modules/sites/routes/floors.routes";
import unitsRoutes from "./modules/sites/routes/units.routes";
import roomsRoutes from "./modules/sites/routes/rooms.routes";
import swaggerSpec from "./swagger";
import swagger from "swagger-ui-express";
import assetCategoryRoutes from "./modules/assets/routes/asset-category.routes";
import assetRoutes from "./modules/assets/routes/asset.routes";
import companiesRoutes from "./modules/companies/companies.routes";
import employeesRoutes from "./modules/employees/employees.routes";
import teamsRoutes from "./modules/teams/teams.routes";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes";

const app: Application = express();

// Security middleware
app.use(helmet());
// Maybe compressor to reduce the size of the response

// CORS configuration
const corsOptions = {
  origin: CONSTANTS.CORS_ORIGIN,
  credentials: CONSTANTS.CORS_CREDENTIALS,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser(CONSTANTS.COOKIE_SECRET));

// HTTP request logging
if (CONSTANTS.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: CONSTANTS.NODE_ENV,
  });
});

// API routes
const API_VERSION = CONSTANTS.API_VERSION;
app.use(`/api/${API_VERSION}/docs`, swagger.serve, swagger.setup(swaggerSpec));

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, apiRateLimiter, userRoutes);
app.use(
  `/api/${API_VERSION}/roles`,
  apiRateLimiter,
  roleRoutes,
  permissionRoutes
);
app.use(`/api/${API_VERSION}/companies`, apiRateLimiter, companiesRoutes);
app.use(`/api/${API_VERSION}/employees`, apiRateLimiter, employeesRoutes);
app.use(`/api/${API_VERSION}/teams`, apiRateLimiter, teamsRoutes);
app.use(`/api/${API_VERSION}/maintenance`, apiRateLimiter, maintenanceRoutes);
// SITES
app.use(`/api/${API_VERSION}/complexes`, apiRateLimiter, complexesRoutes);
app.use(`/api/${API_VERSION}/buildings`, apiRateLimiter, buildingsRoutes);
app.use(`/api/${API_VERSION}/floors`, apiRateLimiter, floorsRoutes);
app.use(`/api/${API_VERSION}/units`, apiRateLimiter, unitsRoutes);
app.use(`/api/${API_VERSION}/rooms`, apiRateLimiter, roomsRoutes);
// ASSETS
app.use(
  `/api/${API_VERSION}/asset-categories`,
  apiRateLimiter,
  assetCategoryRoutes
);
app.use(`/api/${API_VERSION}/assets`, apiRateLimiter, assetRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      code: "NOT_FOUND",
    },
  });
});

app.use(errorMiddleware);

export default app;
