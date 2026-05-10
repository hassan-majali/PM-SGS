import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, FolderKanban, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clients", icon: Building2, label: "Clients" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/initiatives", icon: Lightbulb, label: "Initiatives" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      "relative flex flex-col h-full bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center gap-3 p-4 border-b border-border h-16">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FolderKanban className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm gradient-text">PM Portal</p>
            <p className="text-xs text-muted-foreground">Project Management</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">v1.0.0 Internal</p>
        </div>
      )}
    </aside>
  );
}
