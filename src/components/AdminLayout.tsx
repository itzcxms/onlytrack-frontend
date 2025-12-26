// ==========================================
// ADMIN LAYOUT
// Layout séparé pour l'interface d'administration
// ==========================================

import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  LogOut,
  Shield,
  Loader2,
  UserCog,
  Link,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminInfo {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'admin est connecté
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/moi", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data);
        } else {
          // Rediriger vers login admin
          setLocation("/admin-login");
        }
      } catch {
        setLocation("/admin-login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/deconnexion", {
      method: "POST",
      credentials: "include",
    });
    setLocation("/admin-login");
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Pas connecté
  if (!admin) {
    return null; // La redirection est gérée dans useEffect
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Building2, label: "Agences", path: "/admin/agences" },
    { icon: Users, label: "Utilisateurs", path: "/admin/utilisateurs" },
    { icon: Link, label: "Accès Temporaires", path: "/admin/acces-temporaires" },
    { icon: UserCog, label: "Admins", path: "/admin/admins" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-primary/10 bg-card/50 p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">OnlyTrack</h1>
            <p className="text-xs text-muted-foreground">Espace Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/admin" && location.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-primary/10 pt-4 mt-4">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium">{admin.prenom} {admin.nom}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
