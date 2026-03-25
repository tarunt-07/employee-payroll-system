import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepo } from "./dataStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const ok = (res, data, msg = "Success", code = 200) =>
  res.status(code).json({ success: true, message: msg, data });

const err = (res, msg, code = 400) =>
  res.status(code).json({ success: false, message: msg });

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id || user._id?.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const sanitizeUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!name) return err(res, "Name is required");
    if (!email) return err(res, "Email is required");
    if (password.length < 6) return err(res, "Password must be at least 6 characters long");

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) return err(res, "An account with this email already exists", 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepo.create({ name, email, passwordHash, role: "admin" });
    const token = createToken(user);

    ok(res, { token, user: sanitizeUser(user) }, "Account created successfully", 201);
  } catch (error) {
    err(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) return err(res, "Email and password are required");

    const user = await userRepo.findByEmail(email);
    if (!user) return err(res, "Invalid email or password", 401);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return err(res, "Invalid email or password", 401);

    const token = createToken(user);
    ok(res, { token, user: sanitizeUser(user) }, "Login successful");
  } catch (error) {
    err(res, error.message, 500);
  }
};

export const me = async (req, res) => {
  if (!req.user) return err(res, "Unauthorized", 401);
  return ok(res, sanitizeUser(req.user));
};

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return err(res, "Unauthorized", 401);

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await userRepo.findById(payload.sub);
    if (!user) return err(res, "Unauthorized", 401);

    req.user = user;
    next();
  } catch {
    return err(res, "Unauthorized", 401);
  }
};
