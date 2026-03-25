import { employeeRepo } from "./dataStore.js";
import { calcPayroll, OT_RATE } from "./payroll.js";

const ok = (res, data, msg = "Success", code = 200) =>
  res.status(code).json({ success: true, message: msg, data });

const err = (res, msg, code = 400) =>
  res.status(code).json({ success: false, message: msg });

const normalizeEmployeePayload = (body = {}, { allowPartial = false } = {}) => {
  const payload = {
    empId: typeof body.empId === "string" ? body.empId.trim().toUpperCase() : "",
    name: typeof body.name === "string" ? body.name.trim() : "",
    department: typeof body.department === "string" ? body.department.trim() : "",
    basicPay: Number(body.basicPay),
    otHours: body.otHours === undefined || body.otHours === "" ? 0 : Number(body.otHours),
    otRate: body.otRate === undefined || body.otRate === "" ? OT_RATE : Number(body.otRate),
  };

  if (!allowPartial || "empId" in body) {
    if (!payload.empId) throw new Error("Employee ID is required");
  }
  if (!allowPartial || "name" in body) {
    if (!payload.name) throw new Error("Employee name is required");
  }
  if (!allowPartial || "department" in body) {
    if (!payload.department) throw new Error("Department is required");
  }
  if (!allowPartial || "basicPay" in body) {
    if (!Number.isFinite(payload.basicPay) || payload.basicPay <= 0) {
      throw new Error("Basic pay must be greater than 0");
    }
  }
  if (!Number.isFinite(payload.otHours) || payload.otHours < 0) {
    throw new Error("Overtime hours must be 0 or greater");
  }
  if (!Number.isFinite(payload.otRate) || payload.otRate < 0) {
    throw new Error("Overtime rate must be 0 or greater");
  }

  return payload;
};

export const getAll = async (req, res) => {
  try {
    const { q, sort = "createdAt", order = "desc" } = req.query;
    ok(res, await employeeRepo.findAll({ q, sort, order }));
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const getStats = async (_req, res) => {
  try {
    const employees = await employeeRepo.findAll();
    const total = employees.length;
    const totalCompensation = employees.reduce(
      (sum, employee) => sum + (employee.grossPay || 0),
      0
    );
    const totalTakeHome = employees.reduce((sum, employee) => sum + (employee.netPay || 0), 0);
    const avgCompensation = total ? totalCompensation / total : 0;
    const totalTax = employees.reduce((sum, employee) => sum + (employee.taxAmount || 0), 0);
    const departments = {};

    employees.forEach((employee) => {
      const department = employee.department || "General";
      departments[department] = (departments[department] || 0) + 1;
    });

    ok(res, {
      total,
      totalCompensation,
      totalTakeHome,
      avgCompensation,
      totalTax,
      departments,
    });
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const getDashboardSummary = async (_req, res) => {
  try {
    const employees = await employeeRepo.findAll();
    const recentEmployees = employees.slice(0, 5);
    const highestCompensated = [...employees]
      .sort((left, right) => (right.grossPay || 0) - (left.grossPay || 0))
      .slice(0, 5);
    const departmentCompensation = employees.reduce((acc, employee) => {
      const key = employee.department || "General";
      const current = acc[key] || { gross: 0, net: 0, headcount: 0 };
      acc[key] = {
        gross: current.gross + (employee.grossPay || 0),
        net: current.net + (employee.netPay || 0),
        headcount: current.headcount + 1,
      };
      return acc;
    }, {});

    const topDepartment = Object.entries(departmentCompensation)
      .sort((left, right) => right[1].gross - left[1].gross)[0];

    ok(res, {
      recentEmployees,
      highestCompensated,
      departmentCompensation,
      topDepartment: topDepartment
        ? {
            name: topDepartment[0],
            ...topDepartment[1],
            averageGross: topDepartment[1].headcount
              ? topDepartment[1].gross / topDepartment[1].headcount
              : 0,
          }
        : null,
    });
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const getPayslip = async (req, res) => {
  try {
    const employee = await employeeRepo.findByEmpId(req.params.empId.toUpperCase());
    if (!employee) return err(res, "Employee not found", 404);

    ok(res, {
      ...employee,
      generatedAt: new Date().toISOString(),
      otRate: employee.otRate || OT_RATE,
    });
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const getOne = async (req, res) => {
  try {
    const employee = await employeeRepo.findByEmpId(req.params.empId.toUpperCase());
    if (!employee) return err(res, "Employee not found", 404);
    ok(res, employee);
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    const { empId, name, department, basicPay, otHours, otRate } =
      normalizeEmployeePayload(req.body);
    const payroll = calcPayroll(basicPay, otHours, otRate);
    const employee = await employeeRepo.create({
      empId,
      name,
      department,
      basicPay,
      otHours,
      otRate,
      ...payroll,
    });
    ok(res, employee, "Employee added successfully", 201);
  } catch (error) {
    if (error.code === 11000) return err(res, "Employee ID already exists", 409);
    err(res, error.message, 400);
  }
};

export const update = async (req, res) => {
  try {
    const { name, department, basicPay, otHours, otRate } =
      normalizeEmployeePayload(req.body, { allowPartial: true });
    const payroll = calcPayroll(basicPay, otHours, otRate);
    const employee = await employeeRepo.updateByEmpId(req.params.empId.toUpperCase(), {
      name,
      department,
      basicPay,
      otHours,
      otRate,
      ...payroll,
    });
    if (!employee) return err(res, "Employee not found", 404);
    ok(res, employee, "Employee updated successfully");
  } catch (error) {
    err(res, error.message, 400);
  }
};

export const remove = async (req, res) => {
  try {
    const employee = await employeeRepo.deleteByEmpId(req.params.empId.toUpperCase());
    if (!employee) return err(res, "Employee not found", 404);
    ok(res, null, "Employee deleted successfully");
  } catch (error) {
    err(res, error.message, 500);
  }
};
