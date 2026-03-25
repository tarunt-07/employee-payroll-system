const MOCK_EMPLOYEES_KEY = "payrollpro_mock_employees";
const MOCK_ATTENDANCE_KEY = "payrollpro_mock_attendance";
const MOCK_LEAVES_KEY = "payrollpro_mock_leaves";

const seedEmployees = [
  {
    _id: "1",
    empId: "EMP-101",
    name: "Aarav Mehta",
    department: "Engineering",
    basicPay: 65000,
    otHours: 10,
    otRate: 150,
  },
  {
    _id: "2",
    empId: "EMP-102",
    name: "Siya Kapoor",
    department: "Finance",
    basicPay: 54000,
    otHours: 8,
    otRate: 150,
  },
  {
    _id: "3",
    empId: "EMP-103",
    name: "Rohan Iyer",
    department: "Operations",
    basicPay: 48000,
    otHours: 14,
    otRate: 150,
  },
];

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calcMockPayroll = (basicPay, otHours = 0, otRate = 150) => {
  const hra = basicPay * 0.2;
  const overtimePay = otHours * otRate;
  const grossPay = basicPay + hra + overtimePay;
  const taxAmount = grossPay > 100000 ? grossPay * 0.15 : grossPay > 50000 ? grossPay * 0.1 : grossPay > 25000 ? grossPay * 0.05 : 0;
  const deductions = basicPay * 0.1 + taxAmount + 200;
  const netPay = grossPay - deductions;

  return {
    hra: round(hra),
    overtimePay: round(overtimePay),
    grossPay: round(grossPay),
    taxAmount: round(taxAmount),
    deductions: round(deductions),
    netPay: round(netPay),
  };
};

const withPayroll = (employee) => ({
  ...employee,
  ...calcMockPayroll(employee.basicPay, employee.otHours, employee.otRate),
});

export const getMockEmployees = () => {
  const raw = localStorage.getItem(MOCK_EMPLOYEES_KEY);

  if (!raw) {
    const seeded = seedEmployees.map(withPayroll);
    localStorage.setItem(MOCK_EMPLOYEES_KEY, JSON.stringify(seeded));
    return seeded;
  }

  return JSON.parse(raw);
};

export const saveMockEmployees = (employees) => {
  localStorage.setItem(MOCK_EMPLOYEES_KEY, JSON.stringify(employees));
};

const seedAttendance = [
  { _id: "a1", empId: "EMP-101", employeeName: "Aarav Mehta", date: "2026-03-25", status: "Present", hoursWorked: 9 },
  { _id: "a2", empId: "EMP-102", employeeName: "Siya Kapoor", date: "2026-03-25", status: "WFH", hoursWorked: 8 },
  { _id: "a3", empId: "EMP-103", employeeName: "Rohan Iyer", date: "2026-03-25", status: "Present", hoursWorked: 10 },
];

const seedLeaves = [
  {
    _id: "l1",
    empId: "EMP-102",
    employeeName: "Siya Kapoor",
    department: "Finance",
    leaveType: "Casual Leave",
    fromDate: "2026-03-28",
    toDate: "2026-03-29",
    reason: "Family function",
    status: "Pending",
  },
  {
    _id: "l2",
    empId: "EMP-103",
    employeeName: "Rohan Iyer",
    department: "Operations",
    leaveType: "Sick Leave",
    fromDate: "2026-03-21",
    toDate: "2026-03-22",
    reason: "Recovery",
    status: "Approved",
  },
];

const getStorageList = (key, seed) => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
};

export const getMockAttendance = () => getStorageList(MOCK_ATTENDANCE_KEY, seedAttendance);
export const saveMockAttendance = (entries) =>
  localStorage.setItem(MOCK_ATTENDANCE_KEY, JSON.stringify(entries));

export const getMockLeaves = () => getStorageList(MOCK_LEAVES_KEY, seedLeaves);
export const saveMockLeaves = (entries) =>
  localStorage.setItem(MOCK_LEAVES_KEY, JSON.stringify(entries));
