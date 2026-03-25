import { NavLink } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const links = [
  { to: "/", icon: "DB", label: "Dashboard" },
  { to: "/employees", icon: "EM", label: "Employees" },
  { to: "/add", icon: "AD", label: "Add Employee" },
  { to: "/attendance", icon: "AT", label: "Attendance" },
  { to: "/leaves", icon: "LV", label: "Leaves" },
  { to: "/reports", icon: "RP", label: "Reports" },
  { to: "/payslip", icon: "PS", label: "Payslip" },
  { to: "/settings", icon: "ST", label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand__mark">Rs</div>
        <div>
          <div className="sidebar-brand__title">PayrollPro</div>
          <div className="sidebar-brand__sub">Management System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav__label">Navigation</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <span className="nav-link__icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{user?.name || "Payroll Admin"}</strong>
          <span>{user?.email || "admin@payrollpro.com"}</span>
        </div>
        <div>
          OT Rate: <span className="sidebar-highlight">Rs.150/hr</span>
        </div>
        <button className="ghost-btn sidebar-logout" type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
