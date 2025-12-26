// ==========================================
// ADMIN DASHBOARD
// Vue d'ensemble de l'application
// ==========================================

import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  Crown,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface AdminStats {
  totalAgences: number;
  agencesPremium: number;
  agencesFree: number;
  totalUtilisateurs: number;
  utilisateursActifs: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement stats");
      return res.json();
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard administrateur</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de l'application OnlyTrack
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Agences
                  </CardTitle>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalAgences}</div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Agences Premium
                  </CardTitle>
                  <Crown className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {stats.agencesPremium}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAgences > 0 
                      ? Math.round((stats.agencesPremium / stats.totalAgences) * 100) 
                      : 0}% du total
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Utilisateurs
                  </CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUtilisateurs}</div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Utilisateurs Actifs
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {stats.utilisateursActifs}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Revenus estimés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold gradient-text">
                  ${stats.agencesPremium * 49}/mois
                </div>
                <p className="text-muted-foreground mt-2">
                  Basé sur {stats.agencesPremium} abonnements Premium à $49/mois
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        )}
      </div>
    </AdminLayout>
  );
}
