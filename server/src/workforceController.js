import { attendanceRepo, employeeRepo, leaveRepo } from "./dataStore.js";

const ok = (res, data, msg = "Success", code = 200) =>
  res.status(code).json({ success: true, message: msg, data });

const err = (res, msg, code = 400) =>
  res.status(code).json({ success: false, message: msg });

export const getAttendance = async (_req, res) => {
  try {
    ok(res, await attendanceRepo.findAll());
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const createAttendance = async (req, res) => {
  try {
    const empId = String(req.body.empId || "").trim().toUpperCase();
    const date = String(req.body.date || "").trim();
    const status = String(req.body.status || "Present").trim();
    const hoursWorked = Number(req.body.hoursWorked || 0);

    if (!empId || !date) return err(res, "Employee ID and date are required");

    const employee = await employeeRepo.findByEmpId(empId);
    if (!employee) return err(res, "Employee not found", 404);

    const record = await attendanceRepo.create({
      empId,
      employeeName: employee.name,
      date,
      status,
      hoursWorked,
    });

    ok(res, record, "Attendance recorded successfully", 201);
  } catch (error) {
    err(res, error.message, 400);
  }
};

export const getLeaves = async (_req, res) => {
  try {
    ok(res, await leaveRepo.findAll());
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const createLeave = async (req, res) => {
  try {
    const empId = String(req.body.empId || "").trim().toUpperCase();
    const leaveType = String(req.body.leaveType || "").trim();
    const fromDate = String(req.body.fromDate || "").trim();
    const toDate = String(req.body.toDate || "").trim();
    const reason = String(req.body.reason || "").trim();

    if (!empId || !leaveType || !fromDate || !toDate || !reason) {
      return err(res, "All leave fields are required");
    }

    const employee = await employeeRepo.findByEmpId(empId);
    if (!employee) return err(res, "Employee not found", 404);

    const leave = await leaveRepo.create({
      empId,
      employeeName: employee.name,
      department: employee.department,
      leaveType,
      fromDate,
      toDate,
      reason,
      status: "Pending",
    });

    ok(res, leave, "Leave request submitted successfully", 201);
  } catch (error) {
    err(res, error.message, 400);
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return err(res, "Invalid leave status");
    }

    const leave = await leaveRepo.updateStatus(req.params.id, status);
    if (!leave) return err(res, "Leave request not found", 404);
    ok(res, leave, "Leave status updated successfully");
  } catch (error) {
    err(res, error.message, 400);
  }
};

export const getReportsOverview = async (_req, res) => {
  try {
    const [employees, attendance, leaves] = await Promise.all([
      employeeRepo.findAll(),
      attendanceRepo.findAll(),
      leaveRepo.findAll(),
    ]);

    const attendanceBreakdown = attendance.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const leaveBreakdown = leaves.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    ok(res, {
      headcount: employees.length,
      activeToday: attendance.filter((item) => item.status !== "Absent").length,
      pendingLeaves: leaves.filter((item) => item.status === "Pending").length,
      payrollTotal: employees.reduce((sum, item) => sum + (item.netPay || 0), 0),
      attendanceBreakdown,
      leaveBreakdown,
    });
  } catch (error) {
    err(res, error.message, 500);
  }
};
