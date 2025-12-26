import { AffiliateTable } from "@/components/affiliate-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { Affilie } from "@shared/schema";

export default function Tracking() {
  const { data: affiliates = [] } = useQuery<Affilie[]>({
    queryKey: ["/api/affiliates"],
  });

  // Prepare pie chart data
  const affiliateDistribution = affiliates
    .filter((a) => a.revenus > 0)
    .map((affiliate) => ({
      name: affiliate.nom,
      value: affiliate.revenus,
      color: `hsl(270 ${89 - affiliates.indexOf(affiliate) * 10}% ${66 - affiliates.indexOf(affiliate) * 5}%)`,
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold gradient-text mb-2">
          Tracking Links
        </h1>
        <p className="text-muted-foreground">
          Gérez et suivez vos liens d'affiliation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AffiliateTable />
        </div>

        <Card className="glass-card rounded-3xl">
          <CardHeader>
            <CardTitle className="font-display gradient-text">
              Répartition des revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {affiliateDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée de revenus disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={affiliateDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {affiliateDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 10, 20, 0.9)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
