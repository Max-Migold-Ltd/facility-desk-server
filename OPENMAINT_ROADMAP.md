# OpenMAINT Feature Parity Roadmap
> A personalized tracker to bridge the feature gap between the current **Facility Desk Server** and a fully-featured **openMAINT** / CMDBuild environment.

## 🔴 1. IoT & BMS Integration
*openMAINT heavily features SCADA and BMS (Building Management System) connectors for real-time monitoring.*
- [ ] **MQTT / Telemetry Implementation**: Integrate an MQTT broker (like Mosquitto) or a platform like ThingsBoard.
- [ ] **Device Mapping**: Create a Prisma model linking physical `Assets` to digital IoT `Device` IDs.
- [ ] **Telemetry Ingestion endpoints**: Build subscribers or webhooks to constantly ingest timeseries data (temperature, power state).

## 🔴 2. Automated SLA & Escalation Engine
*openMAINT features a complex, ticking-clock SLA engine that acts automatically when deadlines are breached.*
- [ ] **SLA Policies Model**: Define strict SLA parameters (e.g., "Critical issues must be acknowledged within 15 mins").
- [ ] **Automated Triggers**: Implement a background worker (via BullMQ or Cron) constantly sweeping un-actioned maintenance tickets.
- [ ] **Escalation Logic**: Actions to assign the ticket to a higher-level supervisor and send emergency notifications.

## 🟡 3. Reporting, KPIs & Dashboards
*openMAINT provides custom Jaspersoft reporting out-of-the-box.*
- [ ] **Dashboard API Module**: Create robust `/stats` endpoints returning aggregated data (e.g., ticket count by status, budget depleted, asset breakdown).
- [ ] **Export Engine**: Support exporting lists and single records to strict PDF templates or advanced Excel sheets.
- [ ] **Custom Report Builder**: Basic functionality to allow a user to define which database tables/fields they want extracted.

## 🟡 4. Condition / Meter-Based Maintenance
*Facility Desk handles calendar time scheduling but lacks thresholds.*
- [ ] **Meter Threshold Logic**: Add functionality to trigger Maintenance tasks when a specific metric is breached (e.g., Generator runs for >500 hours, or HVAC temp exceeds param).
- [ ] **Threshold Listeners**: Tie the `IoT` module directly into the `MaintenanceScheduler` to auto-generate tickets off telemetry data.
  
## 🔵 5. GIS & BIM Integration
*openMAINT renders 3D models (IFC files) and map data via GeoServer.*
- [ ] **GIS Coordinates**: Add spatial GIS data (Long, Lat, GeoJSON) to the `Site`, `Building` and `Asset` schema.
- [ ] **BIM/IFC Linking**: Create a strategy/endpoints to serve 3D IFC files attached to Buildings/Spaces, so a frontend can render spatial relationships.

## 🔵 6. Asset Financial Depreciation
*Full asset lifecycle needs financial tracking beyond just original purchase price.*
- [ ] **Depreciation Models**: Create logic for tracking financial depreciation (Straight-line, declining balance) in the `Asset` table over time.
- [ ] **Lifecycle Workflows**: End-of-life status logic to cleanly retire and scrap an asset while retaining its financial history.

## 🔵 7. Mobile & Offline Synchronization
*openMAINT features a dedicated mobile app for offline field work.*
- [ ] **Offline Sync API Design**: Update API payloads and add versioning fields so a mobile app can store changes locally.
- [ ] **Conflict Resolution**: Implement a robust DB conflict resolution handler if a technician syncs an offline ticket that conflict with another user's updates.
