import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, uppercase: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "WFH", "Half Day"],
      default: "Present",
    },
    hoursWorked: { type: Number, default: 8, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

const leaveSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, uppercase: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Work From Home"],
      default: "Casual Leave",
    },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true, versionKey: false }
);

export const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export const LeaveRequest =
  mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveSchema);
