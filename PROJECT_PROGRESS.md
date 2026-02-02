# Project Progress Documentation

## 1. Executive Summary
This document outlines the current state of the implementation for the Facility Desk Server. The application is a robust, modular Node.js/TypeScript backend built with Express and Prisma (PostgreSQL). 

**Key Achievements:**
- ✅ **Clean Architecture:** Modular structure separating Routes, Controllers, Services, and DTOs.
- ✅ **Security:** Comprehensive Authentication & RBAC system.
- ✅ **Core Modules:** Fully implemented Location, Asset, and Maintenance management.
- ✅ **Documentation:** Automated API documentation via Swagger.

**Missing/Pending:**
- ❌ **IoT/ThingsBoard:** No integration found in the current codebase.

---

## 2. Infrastructure & Foundation

### Technology Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** express-validator
- **Job Queue:** BullMQ (Redis) - *Setup for bulk operations like user upload.*

### Middleware Pipeline
The application implements a solid middleware pipeline for security and stability:
1.  **Helmet:** Sets secure HTTP headers.
2.  **CORS:** Configured for cross-origin requests.
3.  **Cookie Parser:** Handles secure cookie management (refresh tokens).
4.  **Morgan:** HTTP request logging.
5.  **Rate Limiting:** `apiRateLimiter` applied to all API routes to prevent abuse.
6.  **Error Handling:** Global error middleware (`error.middleware.ts`) for consistent error responses.

---

## 3. Implemented Modules

### 3.1 User Authentication & Authorization
**Status:** **Completed**
- **Registration:**
  - Standard email/password registration.
  - **Bulk Registration:** Asynchrnous file upload (CSV/Excel) processed via BullMQ queues and workers.
- **Login:**
  - Secure login returning JWT Access Token.
  - Refresh Token stored in secure HTTP-only cookies.
- **Token Management:**
  - `/refresh` endpoint to rotate access tokens seamlessly.
  - `/logout` endpoint to invalidate sessions.
- **Role-Based Access Control (RBAC):**
  - Database-driven Roles (`Role` model).
  - Dynamic Permissions (`Permission` model) linked to Roles.
  - Middleware:
    - `authenticate`: Verifies JWT.
    - `requireRole(["Admin", ...])`: Enforces role checks on routes.

### 3.2 Location Management (Hierarchy)
**Status:** **Completed**
A deep hierarchical model is implemented to map facilities accurately:
- **Sites:** Top-level entity (e.g., a Campus).
- **Complexes:** Groups of buildings.
- **Buildings:** Physical structures.
- **Floors:** Levels within buildings.
- **Zones:** Functional areas (e.g., "North Wing", "Fire Compartment").
- **Spaces:** Individual rooms or units (offices, cleaning rooms).
*All entities support CRUD operations and hierarchical linking.*

### 3.3 Asset Management
**Status:** **Completed**
- **Asset Categories:** Type management (Devices, Machineries, etc.).
- **Asset Registry:** Tracking individual assets with support for:
  - Parent/Child hierarchy (Sub-systems).
  - Linking to specific `Spaces` (Location).
  - QR Code/Tagging support (`tag` field).

### 3.4 Maintenance Management
**Status:** **Advanced Implementation**
The core facility management workflow is well-established.
- **Request Lifecycle:**
  - `POST /maintenance`: Create requests (Corrective/Preventive).
  - `PATCH /:id/status`: Workflow transitions (PENDING -> IN_PROGRESS -> COMPLETED).
  - `PATCH /:id/assign`: Dispatching logic (Assign to User or Team).
- **Features:**
  - **Filtering:** Advanced query filters (Date ranges, Priority, Status, Asset).
  - **Attachments:** Photo upload capability (`/photos` endpoint).
  - **Sub-items:** Tracking components/items used during maintenance (`maintenance-item` routes).
- **Preventive Maintenance:**
  - `Preventive` model exists with scheduling data (Frequency, Cron Expression, Next Run).

### 3.5 Logistics & Inventory
**Status:** **Functional**
- **Items:** Catalog of consumable parts/materials.
- **Warehouses:** Storage locations.
- **Stocks:** Inventory levels and tracking.

### 3.6 Teams & Companies
**Status:** **Functional**
- **Teams:** Grouping users/technicians with Supervisors.
- **Companies:** External entities (Suppliers, Customers) with employee tracking.

---

## 4. API Documentation
**Status:** **Completed**
- **Swagger/OpenAPI:**
  - Automatically generated documentation available at `/api/v1/docs`.
  - Detailed schemas for requests and responses.
  - Interactive UI for testing endpoints.

---

## 5. Missing / To-Do

### 🔴 IoT Integration (ThingsBoard)
- **Current Status:** Not Started.
- **Analysis:** There are no models, configuration files, or libraries installed related to ThingsBoard, MQTT, or Telemetry.
- **Action Required:**
  1.  Install ThingsBoard client libraries or MQTT packages (`mqtt.js`).
  2.  Create `Device` mapping in Prisma (linking Assets to ThingsBoard Device IDs).
  3.  Implement Telemetry ingestion endpoints or MQTT subscribers.

### 🔵 Advanced Scheduling
- While `Preventive` models exist with Cron expressions, the actual **Scheduler Service** (the code that actively spawns Maintenance tasks from Preventive templates) needs verification of full automation (checking `node-cron` usage in `services`).

---

## Summary of Completed "Phases"
1.  **Phase 1: Architecture Setup** - ✅ Done (Repo, TS, Prisma, Express).
2.  **Phase 2: Auth & Security** - ✅ Done (JWT, RBAC, Rate Limits).
3.  **Phase 3: Digital Twin/Location Model** - ✅ Done (Sites -> Spaces).
4.  **Phase 4: Asset Registry** - ✅ Done.
5.  **Phase 5: Maintenance Workflows** - ✅ Done (CRUD, Assign, Status, Checklists).
6.  **Phase 6: API Docs** - ✅ Done (Comprehensive Swagger coverage).
7.  **Phase 7: Finance & Logistics** - ✅ Functionally Enhanced (PO Receipt value calc, Stock consumption during Maintenance).
8.  **Phase 8: IoT Integration** - ⏳ **Pending**.

## Recent Updates (2026-02-02)

### 1. API Documentation
- **Comprehensive Swagger Coverage:**
  - **Auth**: extensive updates including `/register`, `/login`, `/me`, and `/permissions`.
  - **Permissions**: Added full CRUD documentation.
  - **Finance**: Added documentation for Cost Centers, Purchase Requests, and Purchase Orders.
  - **Logistics**: Added documentation for Items, Stocks, Movements, and Warehouses.
  - **Metering**: Added documentation for Meters and Readings.
  - **Maintenance**: Added documentation for maintenance items, financial summary, work logs, and cost breakdown.


### 2. Maintenance Module
- **Consumables Logic:** Implemented `MaintenanceItemService` to handle spare parts consumption.
  - Automatically creates a stock movement (UNLOAD) when a part is added to maintenance.
  - Calculates cost based on item cost and quantity.
- **Checklists/Tasks:**
  - Added `PreventiveTask` model for template checklists.
  - Added `MaintenanceTask` model for per-job checklists with completion status and notes.

### 3. Finance & Logistics
- **Purchase Orders:**
  - Updated `PurchaseOrderService` to calculate and update `totalAmount` when goods are received.
- **Item Cost:**
  - Added `cost` field to `Item` model (Decimal) to support value tracking.
- **Logistics Schema:**
  - Updated `createItemSchema` to include `cost` validation.

## 6. Feature Comparison: Facility Desk vs. OpenMaint

| Feature Area | OpenMaint Service | Facility Desk (Current Status) | Gap Analysis/Notes |
| :--- | :--- | :--- | :--- |
| **Space Management** | Complete hierarchy (Site to Room), GIS/BIM integration. | ✅ Complete hierarchy (Site -> Space). No GIS/BIM. | **Parity Achieved** on core hierarchy. GIS/BIM is a future enhancement. |
| **Asset Registry** | Taxonomy, QR codes, financial depreciation. | ✅ Hierarchical asset registry, tagging support. | **High Parity**. Financial depreciation logic is currently missing. |
| **Corrective Maintenance** | Workflows, SLA tracking, Mobile App. | ✅ Full workflow (Req -> Assign -> Exec -> Close). | **Functional**. Mobile app and complex SLA clocks are missing. |
| **Preventive Maintenance** | Calendar/Meter-based scheduling. | ✅ Calendar-based scheduling (Cron). | **Functional**. Meter-based triggers and advanced recurrence patterns need verification. |
| **Logistics & Inventory** | Multi-warehouse, spare parts, FIFO/LIFO. | ✅ Multi-warehouse, Stock tracking, Movements. | **High Parity**. Valuation methods (FIFO/LIFO) are basic (Standard Cost). |
| **Financial Management** | Budgets, Cost Centers, Purchasing. | ✅ Cost Centers, PR -> PO Workflow, Receipting. | **Functional**. Recently added PO receipt value calculation and item cost tracking. |
| **Energy & Metering** | Meter readings, carbon footprint, analysis. | ⚠️ Basic Meter/Reading models and routes exists. | **Partial**. Logic for analysis and automated alerts is minimal. |
| **IoT / BMS** | SCADA/BMS connectors, real-time monitoring. | ❌ Not Started. | **Major Gap**. No infrastructure for MQTT or telemetry yet. |
| **Reports & Dashboards** | KPIs, Custom Reports. | ❌ Basic API filters only. | **Gap**. No aggregated reporting endpoints or dashboard UI. |

---

## 7. Next Priority Targets
Based on the comparison above, the immediate technical priorities to close the gap are:
1.  **IoT Integration**: Basic MQTT subscriber to ingest Hello World data.
2.  **Reporting**: Create a `/stats` or `/dashboard` endpoint for high-level KPIs (e.g., "Pending Tickets Count", "Budget Utilized %").
3.  **Mobile Readiness**: Ensure all APIs are optimized for mobile consumption (payload sizes, offline sync support mechanisms).
