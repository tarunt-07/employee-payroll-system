import axios from "axios";
import {
  calcMockPayroll,
  getMockAttendance,
  getMockEmployees,
  getMockLeaves,
  saveMockAttendance,
  saveMockEmployees,
  saveMockLeaves,
} from "./mockData.js";

const TOKEN_KEY = "payrollpro_token";
const USER_KEY = "payrollpro_user";
const PREVIEW_TOKEN = "preview-token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const unwrap = (response) => response.data?.data;

export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const request = async (promise) => {
  try {
    const response = await promise;
    return unwrap(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const storeSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const hasSession = () => Boolean(localStorage.getItem(TOKEN_KEY));
export const isPreviewSession = () => localStorage.getItem(TOKEN_KEY) === PREVIEW_TOKEN;

export const startPreviewSession = () => ({
  token: PREVIEW_TOKEN,
  user: {
    id: "preview-user",
    name: "Preview Admin",
    email: "preview@payrollpro.local",
    role: "admin",
  },
});

export const registerUser = (payload) => request(api.post("/auth/register", payload));
export const loginUser = (payload) => request(api.post("/auth/login", payload));
export const getCurrentUser = () =>
  isPreviewSession() ? Promise.resolve(getStoredUser()) : request(api.get("/auth/me"));

export const getEmployees = (params = {}) => {
  if (isPreviewSession()) {
    const employees = getMockEmployees();
    const query = (params.q || "").toLowerCase();

    return Promise.resolve(
      query
        ? employees.filter(
            (employee) =>
              employee.empId.toLowerCase().includes(query) ||
              employee.name.toLowerCase().includes(query)
          )
        : employees
    );
  }

  return request(api.get("/employees", { params }));
};

export const getEmployee = (empId) =>
  isPreviewSession()
    ? Promise.resolve(
        getMockEmployees().find((employee) => employee.empId === empId.toUpperCase()) || null
      )
    : request(api.get(`/employees/${encodeURIComponent(empId)}`));

export const createEmployee = (payload) => {
  if (isPreviewSession()) {
    const employees = getMockEmployees();
    if (employees.some((employee) => employee.empId === payload.empId.toUpperCase())) {
      return Promise.reject(new Error("Employee ID already exists"));
    }
    const employee = {
      _id: String(Date.now()),
      empId: payload.empId.toUpperCase(),
      name: payload.name,
      department: payload.department,
      basicPay: payload.basicPay,
      otHours: payload.otHours || 0,
      otRate: payload.otRate || 150,
      ...calcMockPayroll(payload.basicPay, payload.otHours || 0, payload.otRate || 150),
    };
    saveMockEmployees([employee, ...employees]);
    return Promise.resolve(employee);
  }

  return request(api.post("/employees", payload));
};

export const updateEmployee = (empId, payload) =>
  isPreviewSession()
    ? (() => {
      const employees = getMockEmployees();
        if (
          payload.empId &&
          payload.empId.toUpperCase() !== empId.toUpperCase() &&
          employees.some((employee) => employee.empId === payload.empId.toUpperCase())
        ) {
          return Promise.reject(new Error("Employee ID already exists"));
        }
        const updatedEmployees = employees.map((employee) =>
          employee.empId === empId.toUpperCase()
            ? {
                ...employee,
                ...payload,
                empId: empId.toUpperCase(),
                basicPay: Number(payload.basicPay),
                otHours: Number(payload.otHours || 0),
                otRate: Number(payload.otRate || 150),
                ...calcMockPayroll(
                  Number(payload.basicPay),
                  Number(payload.otHours || 0),
                  Number(payload.otRate || 150)
                ),
              }
            : employee
        );
        const updated = updatedEmployees.find((employee) => employee.empId === empId.toUpperCase());
        if (!updated) {
          return Promise.reject(new Error("Employee not found"));
        }
        saveMockEmployees(updatedEmployees);
        return Promise.resolve(updated);
      })()
    : request(api.put(`/employees/${encodeURIComponent(empId)}`, payload));

export const deleteEmployee = (empId) => {
  if (isPreviewSession()) {
    const employees = getMockEmployees().filter((employee) => employee.empId !== empId);
    saveMockEmployees(employees);
    return Promise.resolve(null);
  }

  return request(api.delete(`/employees/${encodeURIComponent(empId)}`));
};

export const getPayslip = (empId) => {
  if (isPreviewSession()) {
    const employee = getMockEmployees().find(
      (item) => item.empId === empId.trim().toUpperCase()
    );

    if (!employee) {
      return Promise.reject(new Error("Employee not found"));
    }

    return Promise.resolve({
      ...employee,
      generatedAt: new Date().toISOString(),
    });
  }

  return request(api.get(`/employees/payslip/${encodeURIComponent(empId)}`));
};

export const getStats = () => {
  if (isPreviewSession()) {
    const employees = getMockEmployees();
    const totalPayroll = employees.reduce((sum, employee) => sum + (employee.netPay || 0), 0);
    const totalTax = employees.reduce((sum, employee) => sum + (employee.taxAmount || 0), 0);
    const departments = employees.reduce((acc, employee) => {
      acc[employee.department] = (acc[employee.department] || 0) + 1;
      return acc;
    }, {});

    return Promise.resolve({
      total: employees.length,
      totalPayroll,
      avgSalary: employees.length ? totalPayroll / employees.length : 0,
      totalTax,
      departments,
    });
  }

  return request(api.get("/employees/stats"));
};

export const getDashboardSummary = () => {
  if (isPreviewSession()) {
    const employees = getMockEmployees();
    const highestPaid = [...employees]
      .sort((left, right) => (right.netPay || 0) - (left.netPay || 0))
      .slice(0, 5);
    const departmentSpend = employees.reduce((acc, employee) => {
      acc[employee.department] = (acc[employee.department] || 0) + (employee.netPay || 0);
      return acc;
    }, {});

    return Promise.resolve({
      recentEmployees: employees.slice(0, 5),
      highestPaid,
      departmentSpend,
    });
  }

  return request(api.get("/employees/dashboard/summary"));
};

export const getAttendance = () =>
  isPreviewSession()
    ? Promise.resolve(getMockAttendance())
    : request(api.get("/attendance"));

export const createAttendance = (payload) => {
  if (isPreviewSession()) {
    const employees = getMockEmployees();
    const employee = employees.find((item) => item.empId === payload.empId.toUpperCase());
    const entries = getMockAttendance();
    const entry = {
      _id: String(Date.now()),
      empId: payload.empId.toUpperCase(),
      employeeName: employee?.name || payload.employeeName || "Unknown Employee",
      date: payload.date,
      status: payload.status,
      hoursWorked: Number(payload.hoursWorked || 0),
    };
    saveMockAttendance([entry, ...entries]);
    return Promise.resolve(entry);
  }

  return request(api.post("/attendance", payload));
};

export const getLeaves = () =>
  isPreviewSession()
    ? Promise.resolve(getMockLeaves())
    : request(api.get("/leaves"));

export const createLeave = (payload) => {
  if (isPreviewSession()) {
    const employees = getMockEmployees();
    const employee = employees.find((item) => item.empId === payload.empId.toUpperCase());
    const entries = getMockLeaves();
    const leave = {
      _id: String(Date.now()),
      empId: payload.empId.toUpperCase(),
      employeeName: employee?.name || payload.employeeName || "Unknown Employee",
      department: employee?.department || payload.department || "General",
      leaveType: payload.leaveType,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      reason: payload.reason,
      status: "Pending",
    };
    saveMockLeaves([leave, ...entries]);
    return Promise.resolve(leave);
  }

  return request(api.post("/leaves", payload));
};

export const updateLeaveStatus = (leaveId, status) => {
  if (isPreviewSession()) {
    const updatedLeaves = getMockLeaves().map((leave) =>
      leave._id === leaveId ? { ...leave, status } : leave
    );
    const updated = updatedLeaves.find((leave) => leave._id === leaveId);
    saveMockLeaves(updatedLeaves);
    return Promise.resolve(updated);
  }

  return request(api.patch(`/leaves/${encodeURIComponent(leaveId)}/status`, { status }));
};

export const getReportsOverview = async () => {
  if (isPreviewSession()) {
    const [employees, attendance, leaves] = await Promise.all([
      getEmployees(),
      getAttendance(),
      getLeaves(),
    ]);

    const attendanceBreakdown = attendance.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const leaveBreakdown = leaves.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      headcount: employees.length,
      activeToday: attendance.filter((item) => item.status !== "Absent").length,
      pendingLeaves: leaves.filter((item) => item.status === "Pending").length,
      payrollTotal: employees.reduce((sum, item) => sum + (item.netPay || 0), 0),
      attendanceBreakdown,
      leaveBreakdown,
    };
  }

  return request(api.get("/reports/overview"));
};

export { api, PREVIEW_TOKEN, TOKEN_KEY, USER_KEY };
