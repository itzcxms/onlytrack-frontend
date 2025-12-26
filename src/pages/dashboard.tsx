import { useEffect } from "react";
import {
  DollarSign,
  Heart,
  Eye,
  Users,
  UserCheck,
  Link as LinkIcon,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/components/revenue-chart";
import { TodoList } from "@/components/todo-list";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: models = [] } = useQuery<any[]>({
    queryKey: ["/api/models"],
  });

  // Mutation pour vérifier le paiement
  const verifyPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/verify-payment", {
        method: "POST",
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success && data.plan === "premium") {
        toast({
          title: "Abonnement Premium activé !",
          description: "Bienvenue ! Vous avez maintenant accès à toutes les fonctionnalités.",
        });
        // Rafraîchir les données d'abonnement
        queryClient.invalidateQueries({ queryKey: ["/api/stripe/status"] });
      }
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/");
    },
  });

  // Vérifier le paiement si success=true dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      verifyPaymentMutation.mutate();
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos performances
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
        >
          {models.length} modèles actifs
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Chiffre d'affaires total"
          value={
            stats?.revenus !== undefined
              ? `${Math.round(stats.revenus).toLocaleString("fr-FR")} €`
              : "..."
          }
          trend={12.5}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          title="Chiffre d'affaires net"
          value={
            stats?.revenus !== undefined
              ? `${Math.round(stats.revenus * 0.8).toLocaleString("fr-FR")} €`
              : "..."
          }
          trend={8.2}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          title="Vues totales"
          value={
            stats?.vues !== undefined
              ? `${(stats.vues / 1000000).toFixed(1)}M`
              : "..."
          }
          trend={15.3}
          icon={<Eye className="w-5 h-5" />}
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Likes totaux"
          value={
            stats?.likes !== undefined
              ? `${(stats.likes / 1000).toFixed(0)}K`
              : "..."
          }
          trend={18.7}
          icon={<Heart className="w-5 h-5" />}
          iconColor="bg-pink-500/10 text-pink-500"
        />
        <StatCard
          title="Conversions"
          value={stats?.conversions !== undefined ? stats.conversions : "..."}
          trend={5.4}
          icon={<UserCheck className="w-5 h-5" />}
          iconColor="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Affiliés actifs"
          value="2"
          trend={0}
          icon={<LinkIcon className="w-5 h-5" />}
          iconColor="bg-cyan-500/10 text-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <TodoList />
        </div>
      </div>
    </div>
  );
}
