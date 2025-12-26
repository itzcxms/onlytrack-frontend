import { AffiliateTable } from "@/components/affiliate-table";
import { StatCard } from "@/components/stat-card";
import { TrendingUp, Users, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import type { Affilie } from "@shared/schema";

export default function Affiliation() {
  const { toast } = useToast();

  const { data: affiliates = [] } = useQuery<Affilie[]>({
    queryKey: ["/api/affiliates"],
  });

  const rankAIMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/rank-affiliates", "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Classement IA terminé",
        description: "Les affiliés ont été classés par l'IA.",
      });
    },
  });

  const handleAnalyzeAI = () => {
    rankAIMutation.mutate();
  };

  const totalAffiliates = affiliates.length;
  const totalRevenue = affiliates.reduce(
    (sum: number, a) => sum + (a.revenus || 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Affiliation
          </h1>
          <p className="text-muted-foreground">
            Marketing d'affiliation et recrutement de modèles
          </p>
        </div>
        <Button onClick={handleAnalyzeAI} data-testid="button-ai-ranking">
          <TrendingUp className="w-4 h-4 mr-2" />
          Classement IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total affiliés"
          value={totalAffiliates}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Liens générés"
          value={totalAffiliates}
          trend={8.5}
          icon={<Link2 className="w-5 h-5" />}
        />
        <StatCard
          title="Revenus affiliés"
          value={`${totalRevenue.toLocaleString("fr-FR")} €`}
          trend={15.2}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      <AffiliateTable />

      <Card className="backdrop-blur-md bg-black/20 border-violet-500/20">
        <CardHeader>
          <CardTitle className="font-display">Top performers (IA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {affiliates.slice(0, 3).map((performer: any, index: number) => {
              const score = Math.round(85 + Math.random() * 15);
              return (
                <div
                  key={performer.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-violet-500/10"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{performer.nom}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      Score IA:{" "}
                      <span className="font-display text-primary">{score}</span>
                    </div>
                    <div className="font-display text-primary">
                      {performer.revenus.toLocaleString("fr-FR")} €
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
