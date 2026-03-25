import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let storageMode = "memory";

const defaultStore = {
  employees: [],
  users: [],
  attendance: [],
  leaves: [],
};

const sortItems = (items, sort = "createdAt", order = "desc") =>
  [...items].sort((left, right) => {
    const leftValue = left[sort] ?? "";
    const rightValue = right[sort] ?? "";
    if (leftValue === rightValue) return 0;
    const direction = order === "asc" ? 1 : -1;
    return leftValue > rightValue ? direction : -direction;
  });

const ensureFileStore = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(defaultStore, null, 2));
  }
};

const loadStore = async () => {
  await ensureFileStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw);
};

const saveStore = async (store) => {
  await ensureFileStore();
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
};

export const initializeDataStore = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    storageMode = "mongo";
  } catch {
    storageMode = "file";
    await ensureFileStore();
  }

  return storageMode;
};

export const getStorageMode = () => storageMode;

export const userRepo = {
  async findByEmail(email) {
    const store = await loadStore();
    return store.users.find((user) => user.email === email) || null;
  },
  async findById(id) {
    const store = await loadStore();
    return store.users.find((user) => user.id === id) || null;
  },
  async create({ name, email, passwordHash, role }) {
    const store = await loadStore();
    const user = {
      id: randomUUID(),
      _id: randomUUID(),
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users.unshift(user);
    await saveStore(store);
    return user;
  },
};

export const employeeRepo = {
  async findAll({ q = "", sort = "createdAt", order = "desc" } = {}) {
    const store = await loadStore();
    const query = q.trim().toLowerCase();
    const filtered = query
      ? store.employees.filter(
          (employee) =>
            employee.empId.toLowerCase().includes(query) ||
            employee.name.toLowerCase().includes(query)
        )
      : store.employees;
    return sortItems(filtered, sort, order);
  },
  async findByEmpId(empId) {
    const store = await loadStore();
    return store.employees.find((employee) => employee.empId === empId) || null;
  },
  async create(payload) {
    const store = await loadStore();
    if (store.employees.some((employee) => employee.empId === payload.empId)) {
      const error = new Error("Employee ID already exists");
      error.code = 11000;
      throw error;
    }
    const now = new Date().toISOString();
    const employee = { _id: randomUUID(), ...payload, createdAt: now, updatedAt: now };
    store.employees.unshift(employee);
    await saveStore(store);
    return employee;
  },
  async updateByEmpId(empId, payload) {
    const store = await loadStore();
    const index = store.employees.findIndex((employee) => employee.empId === empId);
    if (index === -1) return null;
    const updated = {
      ...store.employees[index],
      ...payload,
      empId,
      updatedAt: new Date().toISOString(),
    };
    store.employees[index] = updated;
    await saveStore(store);
    return updated;
  },
  async deleteByEmpId(empId) {
    const store = await loadStore();
    const index = store.employees.findIndex((employee) => employee.empId === empId);
    if (index === -1) return null;
    const [deleted] = store.employees.splice(index, 1);
    store.attendance = store.attendance.filter((entry) => entry.empId !== empId);
    store.leaves = store.leaves.filter((entry) => entry.empId !== empId);
    await saveStore(store);
    return deleted;
  },
};

export const attendanceRepo = {
  async findAll() {
    const store = await loadStore();
    return sortItems(store.attendance, "date", "desc");
  },
  async create(payload) {
    const store = await loadStore();
    const entry = {
      _id: randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.attendance.unshift(entry);
    await saveStore(store);
    return entry;
  },
};

export const leaveRepo = {
  async findAll() {
    const store = await loadStore();
    return sortItems(store.leaves, "createdAt", "desc");
  },
  async create(payload) {
    const store = await loadStore();
    const leave = {
      _id: randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.leaves.unshift(leave);
    await saveStore(store);
    return leave;
  },
  async updateStatus(id, status) {
    const store = await loadStore();
    const index = store.leaves.findIndex((leave) => leave._id === id);
    if (index === -1) return null;
    store.leaves[index] = {
      ...store.leaves[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    await saveStore(store);
    return store.leaves[index];
  },
};
