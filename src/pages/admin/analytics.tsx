// ==========================================
// ADMIN - ANALYTICS GLOBALES
// Statistiques de l'application (sans agences démo)
// ==========================================

import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  Crown,
  TrendingUp,
  DollarSign,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AdminStats {
  totalAgences: number;
  agencesPremium: number;
  agencesFree: number;
  totalUtilisateurs: number;
  utilisateursActifs: number;
  totalAdmins: number;
  revenuMensuel: number;
  agencesDemo: number;
}

export default function AdminAnalytics() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </AdminLayout>
    );
  }

  const conversionRate = stats.totalAgences > 0 
    ? Math.round((stats.agencesPremium / stats.totalAgences) * 100) 
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Statistiques globales de l'application (hors agences de démo)
          </p>
        </div>

        {/* Avertissement */}
        {stats.agencesDemo > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-400">
              {stats.agencesDemo} agence(s) de démo exclues des statistiques
            </p>
          </div>
        )}

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agences Réelles
              </CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAgences}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.agencesDemo} de démo
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Premium
              </CardTitle>
              <Crown className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.agencesPremium}
              </div>
              <p className="text-xs text-muted-foreground">
                Taux de conversion: {conversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Utilisateurs
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUtilisateurs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.utilisateursActifs} actifs
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ADMINS
              </CardTitle>
              <Shield className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAdmins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenus */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <CardTitle>Revenu Mensuel Récurrent (MRR)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basé sur les abonnements Premium actifs
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold gradient-text">
              {stats.revenuMensuel}€
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/5">
                <p className="text-sm text-muted-foreground">ARR (Annuel)</p>
                <p className="text-2xl font-bold">{stats.revenuMensuel * 12}€</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5">
                <p className="text-sm text-muted-foreground">Revenu moyen par utilisateur (ARPU)</p>
                <p className="text-2xl font-bold">49€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graphique futur */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Évolution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-dashed border-primary/20 rounded-xl">
              <p className="text-muted-foreground">
                📊 Graphiques d'évolution (à venir)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
