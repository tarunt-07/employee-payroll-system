import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import AppLayout from "./AppLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import {
  AddEmployeePage,
  AttendancePage,
  DashboardPage,
  EditEmployeePage,
  EmployeesPage,
  LeavePage,
  LoginPage,
  PayslipPage,
  ReportsPage,
  RegisterPage,
  SettingsPage,
} from "./pages.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:empId/edit" element={<EditEmployeePage />} />
            <Route path="/add" element={<AddEmployeePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leaves" element={<LeavePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/payslip" element={<PayslipPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
