import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  create,
  getAll,
  getDashboardSummary,
  getOne,
  getPayslip,
  getStats,
  remove,
  update,
} from "./employeeController.js";
import { login, me, register, requireAuth } from "./authController.js";
import {
  createAttendance,
  createLeave,
  getAttendance,
  getLeaves,
  getReportsOverview,
  updateLeaveStatus,
} from "./workforceController.js";
import { getStorageMode, initializeDataStore } from "./dataStore.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/employee-payroll-system";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", requireAuth, me);

app.get("/api/employees", requireAuth, getAll);
app.get("/api/employees/stats", requireAuth, getStats);
app.get("/api/employees/dashboard/summary", requireAuth, getDashboardSummary);
app.get("/api/employees/payslip/:empId", requireAuth, getPayslip);
app.get("/api/employees/:empId", requireAuth, getOne);
app.post("/api/employees", requireAuth, create);
app.put("/api/employees/:empId", requireAuth, update);
app.delete("/api/employees/:empId", requireAuth, remove);
app.get("/api/attendance", requireAuth, getAttendance);
app.post("/api/attendance", requireAuth, createAttendance);
app.get("/api/leaves", requireAuth, getLeaves);
app.post("/api/leaves", requireAuth, createLeave);
app.patch("/api/leaves/:id/status", requireAuth, updateLeaveStatus);
app.get("/api/reports/overview", requireAuth, getReportsOverview);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const startServer = async () => {
  try {
    const mode = await initializeDataStore(MONGODB_URI);
    console.log(
      mode === "mongo"
        ? "Connected to MongoDB"
        : "MongoDB unavailable, using local file storage"
    );

    app.listen(PORT, () => {
      console.log(`Payroll API running on http://localhost:${PORT} (${getStorageMode()} mode)`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

export default app;
