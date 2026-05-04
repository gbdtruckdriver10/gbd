"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GBDLogo } from "@/components/GBDLogo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, Calendar, MessageSquare, GraduationCap, ClipboardList, UserCheck, AlertCircle, Settings, LogOut, Home, DollarSign, BarChart3, FolderOpen, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import path from "path";

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      const internalRoute =
        pathname.startsWith("/staff") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/finance");

      router.push(internalRoute ? "/staff-login" : "/login");
    }
  }, [isAuthenticated, isReady, pathname, router]);

  const handleLogout = () => {
  const internalRoute =
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/finance");

  logout();
  router.push(internalRoute ? "/staff-login" : "/login");
};

  const getEffectiveRole = () => {
    if (user?.role) return user.role;

    if (pathname.startsWith("/parent")) return "parent";
    if (pathname.startsWith("/staff")) return "staff";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/finance")) return "cfo";

    return null;
  };
  const effectiveRole = getEffectiveRole();
  const getNavItems = () => {
    switch (effectiveRole) {
      case "parent":
        return [
          { path: "/parent", label: "Dashboard", icon: LayoutDashboard },
          { path: "/parent/documents", label: "Documents", icon: FileText },
          { path: "/parent/attendance", label: "Attendance", icon: Calendar },
          { path: "/parent/messages", label: "Messages", icon: MessageSquare },
          { path: "/parent/programs", label: "Programs", icon: GraduationCap },
          { path: "/parent/billing", label: "Billing", icon: DollarSign }
        ];
      case "staff":
        return [
          { path: "/staff", label: "Dashboard", icon: LayoutDashboard },
          { path: "/staff/roster", label: "Roster", icon: Users },
          { path: "/staff/check-in", label: "Check-In/Out", icon: UserCheck },
          { path: "/staff/daily-log", label: "Daily Log", icon: FileText },
          { path: "/staff/messages", label: "Messages", icon: MessageSquare },
          { path: "/staff/incidents", label: "Incidents", icon: AlertCircle },
        ];
      case "admin":
        return [
          { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { path: "/admin/admissions", label: "Admissions", icon: ClipboardList },
          { path: "/admin/classrooms", label: "Classrooms", icon: Users },
          { path: "/admin/programs", label: "Programs", icon: GraduationCap },
          { path: "/admin/reports", label: "Reports", icon: BarChart3 },
          { path: "/admin/content", label: "Content", icon: FileText },
          { path: "/admin/team", label: "Team", icon: FolderOpen },
          { path: "/admin/settings", label: "Settings", icon: Settings }
        ];
      case "cfo":
        return [
          { path: "/finance", label: "Dashboard", icon: LayoutDashboard },
          { path: "/finance/invoices", label: "Invoices", icon: DollarSign },
          { path: "/finance/reports", label: "Reports", icon: BarChart3 },
        ];
      default:
        return [];
    }
  };
  const getRoleLabel = (role?: string | null) => {
    switch (role) {
      case "parent":
        return "Parent";
      case "staff":
        return "Staff";
      case "admin":
        return "Admin";
      case "cfo":
        return "CFO";
      default:
        return "";
    }
  };
  const navItems = getNavItems();
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  if (!isReady) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center" onClick={() => setSidebarOpen(false)}>
            <GBDLogo showText={false} />
          </Link>
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-md" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path) ? "bg-[#2888B8]/10 text-[#2888B8]" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-md" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          {effectiveRole ? (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>Role:</span>
              <span className="inline-flex items-center rounded-full bg-[#2888B8]/10 px-3 py-1 text-xs font-semibold text-[#2888B8]">
                {getRoleLabel(effectiveRole)}
              </span>
            </div>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/"><Home size={16} className="mr-2" />Public Site</Link>
          </Button>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}