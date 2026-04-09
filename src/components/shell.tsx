import type { ReactNode } from "react";
import { BrainCircuit, LayoutDashboard, Layers3, Settings2, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

interface ShellProps {
  children: ReactNode;
}

const navItems = [
  { label: "Workout", href: "/workout", icon: Sparkles },
  { label: "Games", href: "/games", icon: BrainCircuit },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings2 },
  { label: "Home", href: "/", icon: Layers3 },
];

export function Shell({ children }: ShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="Brain Curls home">
          <span className="brand-mark">BC</span>
          <span>
            <strong>Brain Curls</strong>
            <small>adaptive cognitive training</small>
          </span>
        </NavLink>

        <nav className="nav">
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={label}
              className={({ isActive }: { isActive: boolean }) =>
                `nav-link${isActive ? " active" : ""}`
              }
              to={href}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {children}
    </div>
  );
}
