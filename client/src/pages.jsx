import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  createAttendance,
  createEmployee,
  createLeave,
  deleteEmployee,
  getAttendance,
  getDashboardSummary,
  getEmployee,
  getEmployees,
  getLeaves,
  getPayslip,
  getReportsOverview,
  getStats,
  updateEmployee,
  updateLeaveStatus,
} from "./api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const emptyEmployee = {
  empId: "",
  name: "",
  department: "",
  basicPay: "",
  otHours: "",
  otRate: "150",
};

function MetricCard({ label, value, accent = "var(--gold)" }) {
  return (
    <div className="stat-card metric-card">
      <div className="metric-dot" style={{ background: accent }} />
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="center-state empty-state">{text}</div>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, enterPreviewMode } = useAuth();
  const pushToast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      pushToast("Welcome back to PayrollPro");
      navigate("/", { replace: true });
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    enterPreviewMode();
    pushToast("Preview mode enabled");
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-backdrop">
        <div className="auth-copy">
          <span className="eyebrow">PayrollPro</span>
          <h1>Run payroll from a sharper command center.</h1>
          <p>
            Manage employees, protect payroll access, and generate payslips from one elegant
            workspace.
          </p>
          <div className="feature-strip">
            <div className="mini-card">
              <strong>Secure access</strong>
              <span>JWT-based sign in and register flow</span>
            </div>
            <div className="mini-card">
              <strong>Finance pulse</strong>
              <span>Track payroll totals, tax, and department spend</span>
            </div>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className="auth-muted">Use your payroll admin account to continue.</p>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="admin@payrollpro.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter your password"
              required
            />
          </div>
          <button className="btn auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
          <button className="ghost-btn auth-btn" type="button" onClick={handlePreview}>
            Explore preview mode
          </button>
          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, enterPreviewMode } = useAuth();
  const pushToast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await register(form);
      pushToast("Account created successfully");
      navigate("/", { replace: true });
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    enterPreviewMode();
    pushToast("Preview mode enabled");
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-backdrop">
        <div className="auth-copy">
          <span className="eyebrow">Create Workspace</span>
          <h1>Launch your payroll workspace with a clean first step.</h1>
          <p>
            Set up your admin account now, then move straight into employee setup and payroll
            insights.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Register</h2>
          <p className="auth-muted">Create the admin account for this payroll workspace.</p>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Tarun Sharma"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <button className="btn auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <button className="ghost-btn auth-btn" type="button" onClick={handlePreview}>
            Explore preview mode
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    totalCompensation: 0,
    totalTakeHome: 0,
    avgCompensation: 0,
    totalTax: 0,
    departments: {},
  });
  const [summary, setSummary] = useState({
    recentEmployees: [],
    highestCompensated: [],
    departmentCompensation: {},
    topDepartment: null,
  });
  const [loading, setLoading] = useState(true);
  const pushToast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [statsData, summaryData] = await Promise.all([getStats(), getDashboardSummary()]);
        if (active) {
          setStats(statsData);
          setSummary(summaryData);
        }
      } catch (error) {
        if (active) {
          pushToast(error.message, "error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [pushToast]);

  return (
    <div className="page">
      <div className="hero-panel">
        <div>
          <span className="eyebrow">Operations cockpit</span>
          <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0] || "Admin"}</h1>
          <p className="page-subtitle">
            Stay on top of payroll flow, recent hires, and compensation patterns across the team.
          </p>
        </div>
        <div className="hero-panel__badge">
          <span>Protected workspace</span>
          <strong>{user?.role || "admin"}</strong>
        </div>
      </div>

      <div className="grid cols-4">
        <MetricCard label="Employees" value={loading ? "..." : stats.total} accent="var(--gold)" />
        <MetricCard
          label="Total compensation"
          value={loading ? "..." : currency.format(stats.totalCompensation || 0)}
          accent="#84cc16"
        />
        <MetricCard
          label="Average gross pay"
          value={loading ? "..." : currency.format(stats.avgCompensation || 0)}
          accent="#38bdf8"
        />
        <MetricCard
          label="Take-home total"
          value={loading ? "..." : currency.format(stats.totalTakeHome || 0)}
          accent="#fb7185"
        />
      </div>

      <div className="grid cols-2 section-gap">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Recent employees</h2>
              <p>Fresh additions across the payroll workspace.</p>
            </div>
            <Link className="text-link" to="/employees">
              View all
            </Link>
          </div>
          <div className="stack-list">
            {summary.recentEmployees.length ? (
              summary.recentEmployees.map((employee) => (
                <article className="list-row" key={employee._id}>
                  <div>
                    <strong>{employee.name}</strong>
                    <span>
                      {employee.empId} · {employee.department}
                    </span>
                  </div>
                  <strong>{currency.format(employee.grossPay || 0)}</strong>
                </article>
              ))
            ) : (
              <EmptyState text="No employees yet. Add your first employee to populate the dashboard." />
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2>Top compensation</h2>
              <p>The highest current gross compensation across the organization.</p>
            </div>
          </div>
          <div className="stack-list">
            {summary.highestCompensated.length ? (
              summary.highestCompensated.map((employee) => (
                <article className="list-row" key={employee._id}>
                  <div>
                    <strong>{employee.name}</strong>
                    <span>{employee.department}</span>
                  </div>
                  <strong>{currency.format(employee.grossPay || 0)}</strong>
                </article>
              ))
            ) : (
              <EmptyState text="Compensation insights will appear here after employees are added." />
            )}
          </div>
        </section>
      </div>

      <section className="card section-gap">
        <div className="section-head">
          <div>
            <h2>Department compensation share</h2>
            <p>Gross compensation distribution across departments.</p>
          </div>
          {summary.topDepartment ? (
            <div className="hero-panel__badge">
              <span>Top department</span>
              <strong>{summary.topDepartment.name}</strong>
            </div>
          ) : null}
        </div>
        <div className="department-bars">
          {Object.entries(summary.departmentCompensation || {}).length ? (
            Object.entries(summary.departmentCompensation).map(([department, details]) => (
              <div className="bar-row" key={department}>
                <div className="bar-row__meta">
                  <span>{department} · {details.headcount} people</span>
                  <strong>{currency.format(details.gross)}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.max(
                        8,
                        Math.round(
                          (details.gross / (stats.totalCompensation || details.gross || 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <div className="bar-row__meta">
                  <span>Avg gross: {currency.format(details.gross / details.headcount)}</span>
                  <span>Take-home: {currency.format(details.net)}</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState text="Department compensation split will appear once employee salaries are available." />
          )}
        </div>
      </section>
    </div>
  );
}

export function EmployeesPage() {
  const pushToast = useToast();
  const [employees, setEmployees] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;

    const loadEmployees = async () => {
      try {
        const data = await getEmployees(query ? { q: query } : {});
        if (active) {
          setEmployees(data);
        }
      } catch (error) {
        if (active) {
          pushToast(error.message, "error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      active = false;
    };
  }, [pushToast, query]);

  const handleDelete = async (empId) => {
    try {
      await deleteEmployee(empId);
      setEmployees((current) => current.filter((employee) => employee.empId !== empId));
      pushToast("Employee deleted successfully");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            Search employee records, review payroll values, and keep the roster clean.
          </p>
        </div>
        <Link className="btn" to="/add">
          Add employee
        </Link>
      </div>

      <section className="card">
        <div className="toolbar">
          <input
            className="input"
            value={query}
            onChange={(event) =>
              setSearchParams(event.target.value ? { q: event.target.value } : {})
            }
            placeholder="Search by name or employee ID"
          />
        </div>
        {loading ? (
          <div className="center-state">Loading employees...</div>
        ) : employees.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Basic Pay</th>
                  <th>Net Pay</th>
                  <th>Overtime</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>
                      <strong>{employee.name}</strong>
                      <div className="cell-subtext">{employee.empId}</div>
                    </td>
                    <td>{employee.department}</td>
                    <td>{currency.format(employee.basicPay || 0)}</td>
                    <td>{currency.format(employee.netPay || 0)}</td>
                    <td>{employee.otHours || 0} hrs</td>
                    <td>
                      <div className="table-actions">
                        <Link className="ghost-btn" to={`/employees/${employee.empId}/edit`}>
                          Edit
                        </Link>
                        <Link className="ghost-btn" to={`/payslip?empId=${employee.empId}`}>
                          Payslip
                        </Link>
                        <button
                          className="ghost-btn danger"
                          type="button"
                          onClick={() => handleDelete(employee.empId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="No employees found for the current search." />
        )}
      </section>
    </div>
  );
}

export function AddEmployeePage() {
  const navigate = useNavigate();
  const pushToast = useToast();
  const [form, setForm] = useState(emptyEmployee);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    const basicPay = Number(form.basicPay) || 0;
    const otHours = Number(form.otHours) || 0;
    const otRate = Number(form.otRate) || 150;
    const overtimePay = otHours * otRate;
    const hra = basicPay * 0.2;
    const grossPay = basicPay + overtimePay + hra;
    const taxAmount =
      grossPay > 100000
        ? grossPay * 0.15
        : grossPay > 50000
          ? grossPay * 0.1
          : grossPay > 25000
            ? grossPay * 0.05
            : 0;
    const deductions = basicPay * 0.1 + taxAmount + 200;
    const netPay = grossPay - deductions;

    return { grossPay, netPay, overtimePay };
  }, [form.basicPay, form.otHours, form.otRate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createEmployee({
        ...form,
        basicPay: Number(form.basicPay),
        otHours: Number(form.otHours || 0),
        otRate: Number(form.otRate || 150),
      });
      pushToast("Employee added successfully");
      navigate("/employees");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Employee</h1>
          <p className="page-subtitle">
            Create a fresh employee record and preview salary impact before saving.
          </p>
        </div>
      </div>

      <div className="grid cols-2">
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="empId">Employee ID</label>
              <input
                id="empId"
                className="input"
                name="empId"
                value={form.empId}
                onChange={handleChange}
                placeholder="EMP-101"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Employee name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                className="input"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Engineering"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="basicPay">Basic Pay</label>
              <input
                id="basicPay"
                className="input"
                name="basicPay"
                type="number"
                min="1"
                value={form.basicPay}
                onChange={handleChange}
                placeholder="50000"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="otHours">Overtime Hours</label>
              <input
                id="otHours"
                className="input"
                name="otHours"
                type="number"
                min="0"
                value={form.otHours}
                onChange={handleChange}
                placeholder="12"
              />
            </div>
            <div className="field">
              <label htmlFor="otRate">OT Rate</label>
              <input
                id="otRate"
                className="input"
                name="otRate"
                type="number"
                min="0"
                value={form.otRate}
                onChange={handleChange}
                placeholder="150"
              />
            </div>
          </div>
          <button className="btn section-gap" type="submit" disabled={submitting}>
            {submitting ? "Saving employee..." : "Save employee"}
          </button>
        </form>

        <section className="card preview-card">
          <span className="eyebrow">Live preview</span>
          <h2>Projected payroll snapshot</h2>
          <div className="grid cols-3">
            <MetricCard label="Overtime Pay" value={currency.format(preview.overtimePay || 0)} />
            <MetricCard label="Gross Pay" value={currency.format(preview.grossPay || 0)} />
            <MetricCard label="Net Pay" value={currency.format(preview.netPay || 0)} />
          </div>
          <p className="page-subtitle">
            This preview mirrors the backend calculation logic so you can catch odd values before
            submission.
          </p>
        </section>
      </div>
    </div>
  );
}

export function EditEmployeePage() {
  const { empId } = useParams();
  const navigate = useNavigate();
  const pushToast = useToast();
  const [form, setForm] = useState(emptyEmployee);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadEmployee = async () => {
      try {
        const employee = await getEmployee(empId);
        if (active && employee) {
          setForm({
            empId: employee.empId,
            name: employee.name,
            department: employee.department,
            basicPay: String(employee.basicPay ?? ""),
            otHours: String(employee.otHours ?? 0),
            otRate: String(employee.otRate ?? 150),
          });
        } else if (active) {
          setMissing(true);
        }
      } catch (error) {
        if (active) {
          pushToast(error.message, "error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEmployee();

    return () => {
      active = false;
    };
  }, [empId, pushToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await updateEmployee(empId, {
        ...form,
        basicPay: Number(form.basicPay),
        otHours: Number(form.otHours || 0),
        otRate: Number(form.otRate || 150),
      });
      pushToast("Employee updated successfully");
      navigate("/employees");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="center-state">Loading employee details...</div>;
  }

  if (missing) {
    return <EmptyState text="Employee not found for editing." />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Employee</h1>
          <p className="page-subtitle">Update profile, pay, and overtime details.</p>
        </div>
      </div>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="edit-empId">Employee ID</label>
            <input id="edit-empId" className="input" value={form.empId} disabled />
          </div>
          <div className="field">
            <label htmlFor="edit-name">Name</label>
            <input id="edit-name" className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="edit-department">Department</label>
            <input id="edit-department" className="input" name="department" value={form.department} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="edit-basicPay">Basic Pay</label>
            <input id="edit-basicPay" className="input" name="basicPay" type="number" min="1" value={form.basicPay} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="edit-otHours">Overtime Hours</label>
            <input id="edit-otHours" className="input" name="otHours" type="number" min="0" value={form.otHours} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="edit-otRate">OT Rate</label>
            <input id="edit-otRate" className="input" name="otRate" type="number" min="0" value={form.otRate} onChange={handleChange} />
          </div>
        </div>
        <button className="btn section-gap" type="submit" disabled={submitting}>
          {submitting ? "Updating employee..." : "Update employee"}
        </button>
      </form>
    </div>
  );
}

export function PayslipPage() {
  const pushToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [empIdInput, setEmpIdInput] = useState(searchParams.get("empId") || "");
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!empIdInput.trim()) {
      pushToast("Enter an employee ID", "info");
      return;
    }

    setLoading(true);
    try {
      const data = await getPayslip(empIdInput.trim());
      setPayslip(data);
      setSearchParams({ empId: empIdInput.trim() });
    } catch (error) {
      pushToast(error.message, "error");
      setPayslip(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payslip Generator</h1>
          <p className="page-subtitle">
            Fetch an employee by ID and present the current payroll breakdown instantly.
          </p>
        </div>
      </div>

      <form className="card toolbar-form" onSubmit={handleGenerate}>
        <input
          className="input"
          value={empIdInput}
          onChange={(event) => setEmpIdInput(event.target.value)}
          placeholder="Enter employee ID"
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate payslip"}
        </button>
      </form>

      {payslip ? (
        <section className="card section-gap payslip-card">
          <div className="section-head">
            <div>
              <h2>{payslip.name}</h2>
              <p>
                {payslip.empId} · {payslip.department}
              </p>
            </div>
            <div className="hero-panel__badge">
              <span>Generated</span>
              <strong>{new Date(payslip.generatedAt).toLocaleDateString()}</strong>
            </div>
          </div>
          <div className="grid cols-3">
            <MetricCard label="Basic Pay" value={currency.format(payslip.basicPay || 0)} />
            <MetricCard label="HRA" value={currency.format(payslip.hra || 0)} />
            <MetricCard label="OT Pay" value={currency.format(payslip.overtimePay || 0)} />
            <MetricCard label="Gross" value={currency.format(payslip.grossPay || 0)} />
            <MetricCard label="Tax" value={currency.format(payslip.taxAmount || 0)} />
            <MetricCard label="Net Pay" value={currency.format(payslip.netPay || 0)} />
          </div>
        </section>
      ) : (
        <div className="section-gap">
          <EmptyState text="No payslip loaded yet. Enter an employee ID above to generate one." />
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Settings</h1>
          <p className="page-subtitle">
            Review the active admin account and sign out when you are done.
          </p>
        </div>
      </div>
      <section className="card">
        <div className="stack-list">
          <article className="list-row">
            <div>
              <strong>{user?.name}</strong>
              <span>Active administrator</span>
            </div>
            <strong>{user?.role}</strong>
          </article>
          <article className="list-row">
            <div>
              <strong>{user?.email}</strong>
              <span>Login email</span>
            </div>
          </article>
        </div>
        <button className="btn btn-secondary section-gap" type="button" onClick={logout}>
          Sign out
        </button>
      </section>
    </div>
  );
}

export function AttendancePage() {
  const pushToast = useToast();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    empId: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    hoursWorked: "8",
  });

  useEffect(() => {
    getAttendance().then(setEntries).catch((error) => pushToast(error.message, "error"));
  }, [pushToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const created = await createAttendance({
        ...form,
        hoursWorked: Number(form.hoursWorked || 0),
      });
      setEntries((current) => [created, ...current]);
      pushToast("Attendance saved");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track daily attendance, WFH, and hours worked.</p>
        </div>
      </div>
      <div className="grid cols-2">
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Employee ID</label>
              <input className="input" value={form.empId} onChange={(event) => setForm((current) => ({ ...current, empId: event.target.value }))} required />
            </div>
            <div className="field">
              <label>Date</label>
              <input className="input" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option>Present</option>
                <option>WFH</option>
                <option>Half Day</option>
                <option>Absent</option>
              </select>
            </div>
            <div className="field">
              <label>Hours Worked</label>
              <input className="input" type="number" min="0" value={form.hoursWorked} onChange={(event) => setForm((current) => ({ ...current, hoursWorked: event.target.value }))} />
            </div>
          </div>
          <button className="btn section-gap" type="submit">Save attendance</button>
        </form>
        <section className="card">
          <h2 style={{ marginTop: 0 }}>Recent attendance</h2>
          <div className="stack-list">
            {entries.length ? entries.slice(0, 8).map((entry) => (
              <article className="list-row" key={entry._id}>
                <div>
                  <strong>{entry.employeeName || entry.empId}</strong>
                  <span>{entry.empId} · {entry.date}</span>
                </div>
                <div className="status-stack">
                  <span className={`status-pill ${entry.status.toLowerCase().replace(/\s+/g, "-")}`}>{entry.status}</span>
                  <strong>{entry.hoursWorked} hrs</strong>
                </div>
              </article>
            )) : <EmptyState text="No attendance records yet." />}
          </div>
        </section>
      </div>
    </div>
  );
}

export function LeavePage() {
  const pushToast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    empId: "",
    leaveType: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    getLeaves().then(setLeaves).catch((error) => pushToast(error.message, "error"));
  }, [pushToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const created = await createLeave(form);
      setLeaves((current) => [created, ...current]);
      setForm({ empId: "", leaveType: "Casual Leave", fromDate: "", toDate: "", reason: "" });
      pushToast("Leave request submitted");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const updated = await updateLeaveStatus(id, status);
      setLeaves((current) => current.map((leave) => (leave._id === id ? updated : leave)));
      pushToast(`Leave ${status.toLowerCase()}`);
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Submit, review, and approve employee leave requests.</p>
        </div>
      </div>
      <div className="grid cols-2">
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Employee ID</label>
              <input className="input" value={form.empId} onChange={(event) => setForm((current) => ({ ...current, empId: event.target.value }))} required />
            </div>
            <div className="field">
              <label>Leave Type</label>
              <select className="select" value={form.leaveType} onChange={(event) => setForm((current) => ({ ...current, leaveType: event.target.value }))}>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>Work From Home</option>
              </select>
            </div>
            <div className="field">
              <label>From</label>
              <input className="input" type="date" value={form.fromDate} onChange={(event) => setForm((current) => ({ ...current, fromDate: event.target.value }))} required />
            </div>
            <div className="field">
              <label>To</label>
              <input className="input" type="date" value={form.toDate} onChange={(event) => setForm((current) => ({ ...current, toDate: event.target.value }))} required />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Reason</label>
              <textarea className="textarea" rows="4" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} required />
            </div>
          </div>
          <button className="btn section-gap" type="submit">Submit leave</button>
        </form>
        <section className="card">
          <h2 style={{ marginTop: 0 }}>Requests</h2>
          <div className="stack-list">
            {leaves.length ? leaves.slice(0, 8).map((leave) => (
              <article className="list-row" key={leave._id}>
                <div>
                  <strong>{leave.employeeName}</strong>
                  <span>{leave.empId} · {leave.leaveType} · {leave.fromDate} to {leave.toDate}</span>
                </div>
                <div className="status-stack">
                  <span className={`status-pill ${leave.status.toLowerCase()}`}>{leave.status}</span>
                  {leave.status === "Pending" ? (
                    <div className="table-actions">
                      <button className="ghost-btn" type="button" onClick={() => handleStatus(leave._id, "Approved")}>Approve</button>
                      <button className="ghost-btn danger" type="button" onClick={() => handleStatus(leave._id, "Rejected")}>Reject</button>
                    </div>
                  ) : null}
                </div>
              </article>
            )) : <EmptyState text="No leave requests yet." />}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const pushToast = useToast();
  const [report, setReport] = useState(null);

  useEffect(() => {
    getReportsOverview().then(setReport).catch((error) => pushToast(error.message, "error"));
  }, [pushToast]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">A quick executive snapshot of people, payroll, attendance, and leave.</p>
        </div>
      </div>
      {report ? (
        <>
          <div className="grid cols-4">
            <MetricCard label="Headcount" value={report.headcount} accent="#f4c430" />
            <MetricCard label="Active Today" value={report.activeToday} accent="#22c55e" />
            <MetricCard label="Pending Leaves" value={report.pendingLeaves} accent="#fb7185" />
            <MetricCard label="Compensation Total" value={currency.format(report.compensationTotal || 0)} accent="#38bdf8" />
          </div>
          <div className="grid cols-2 section-gap">
            <section className="card">
              <h2 style={{ marginTop: 0 }}>Compensation Snapshot</h2>
              <div className="stack-list">
                <article className="list-row">
                  <strong>Gross compensation</strong>
                  <span>{currency.format(report.compensationTotal || 0)}</span>
                </article>
                <article className="list-row">
                  <strong>Take-home payout</strong>
                  <span>{currency.format(report.takeHomeTotal || 0)}</span>
                </article>
              </div>
            </section>
            <section className="card">
              <h2 style={{ marginTop: 0 }}>Planning Notes</h2>
              <div className="stack-list">
                <article className="list-row">
                  <strong>Tax drag</strong>
                  <span>
                    {report.compensationTotal
                      ? `${Math.round(
                          ((report.compensationTotal - report.takeHomeTotal) /
                            report.compensationTotal) *
                            100
                        )}%`
                      : "0%"}
                  </span>
                </article>
                <article className="list-row">
                  <strong>Workforce health</strong>
                  <span>{report.activeToday} active today</span>
                </article>
              </div>
            </section>
          </div>
          <div className="grid cols-2 section-gap">
            <section className="card">
              <h2 style={{ marginTop: 0 }}>Attendance Mix</h2>
              <div className="stack-list">
                {Object.entries(report.attendanceBreakdown || {}).length ? Object.entries(report.attendanceBreakdown || {}).map(([label, count]) => (
                  <article className="list-row" key={label}>
                    <strong>{label}</strong>
                    <span>{count}</span>
                  </article>
                )) : <EmptyState text="No attendance analytics yet." />}
              </div>
            </section>
            <section className="card">
              <h2 style={{ marginTop: 0 }}>Leave Mix</h2>
              <div className="stack-list">
                {Object.entries(report.leaveBreakdown || {}).length ? Object.entries(report.leaveBreakdown || {}).map(([label, count]) => (
                  <article className="list-row" key={label}>
                    <strong>{label}</strong>
                    <span>{count}</span>
                  </article>
                )) : <EmptyState text="No leave analytics yet." />}
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="center-state">Loading reports...</div>
      )}
    </div>
  );
}
