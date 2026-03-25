import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    empId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]+$/, "Employee ID may only contain letters, numbers, and hyphens"],
    },
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      minlength: [2, "Employee name must be at least 2 characters long"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      default: "General",
    },
    basicPay: {
      type: Number,
      required: [true, "Basic pay is required"],
      min: [1, "Basic pay must be greater than 0"],
    },
    otHours: {
      type: Number,
      default: 0,
      min: [0, "Overtime hours cannot be negative"],
    },
    otRate: {
      type: Number,
      default: 150,
      min: [0, "Overtime rate cannot be negative"],
    },
    hra: {
      type: Number,
      default: 0,
      min: [0, "HRA cannot be negative"],
    },
    overtimePay: {
      type: Number,
      default: 0,
      min: [0, "Overtime pay cannot be negative"],
    },
    grossPay: {
      type: Number,
      default: 0,
      min: [0, "Gross pay cannot be negative"],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, "Tax amount cannot be negative"],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, "Deductions cannot be negative"],
    },
    netPay: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

employeeSchema.index({ empId: 1 }, { unique: true });
employeeSchema.index({ name: 1 });
employeeSchema.index({ department: 1 });

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
