import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface RevenueChartProps {
  title?: string;
  data?: { date: string; revenus: number }[];
}

export function RevenueChart({
  title = "Évolution du chiffre d'affaires",
  data,
}: RevenueChartProps) {
  const [period, setPeriod] = useState<"7" | "30" | "90" | "custom">("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  // Fetch data with period filter
  const { data: fetchedData = [] } = useQuery<
    { date: string; revenus: number }[]
  >({
    queryKey: ["/api/dashboard/revenue", period, customStart, customEnd],
    queryFn: async () => {
      // Build query params based on current period
      const queryParams = new URLSearchParams();
      if (period === "custom" && customStart && customEnd) {
        queryParams.append("startDate", customStart);
        queryParams.append("endDate", customEnd);
      } else {
        queryParams.append("days", period);
      }

      const response = await fetch(`/api/dashboard/revenue?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch revenue data");
      return response.json();
    },
    enabled: !data,
  });

  // Formater les données avec les dates au format français
  const chartData = (data || fetchedData).map(item => {
    if (typeof item.date === "string" && item.date.includes("-")) {
      const [year, month, day] = item.date.split("-");
      return {
        ...item,
        date: `${day}/${month}/${year}`
      };
    }
    return item;
  });

  const applyCustomDates = () => {
    if (customStart && customEnd) {
      setPeriod("custom");
      setCustomDialogOpen(false);
    }
  };

  return (
    <Card className="glass-card rounded-3xl" data-testid="card-revenue-chart">
      <CardHeader>
        <CardTitle className="font-display text-xl gradient-text">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={period === "7" ? "default" : "secondary"}
            size="sm"
            onClick={() => setPeriod("7")}
            data-testid="button-period-7days"
            className="text-xs rounded-xl"
          >
            7 jours
          </Button>
          <Button
            variant={period === "30" ? "default" : "secondary"}
            size="sm"
            onClick={() => setPeriod("30")}
            data-testid="button-period-30days"
            className="text-xs rounded-xl"
          >
            30 jours
          </Button>
          <Button
            variant={period === "90" ? "default" : "secondary"}
            size="sm"
            onClick={() => setPeriod("90")}
            data-testid="button-period-90days"
            className="text-xs rounded-xl"
          >
            90 jours
          </Button>
          <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={period === "custom" ? "default" : "secondary"}
                size="sm"
                data-testid="button-period-custom"
                className="text-xs rounded-xl"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Personnalisé
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="font-display gradient-text">
                  Période personnalisée
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Date de début</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    data-testid="input-custom-start"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Date de fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    data-testid="input-custom-end"
                  />
                </div>
                <Button
                  onClick={applyCustomDates}
                  className="w-full"
                  data-testid="button-apply-custom"
                  disabled={!customStart || !customEnd}
                >
                  Appliquer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(270 89% 66%)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(270 89% 66%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              stroke="hsl(270 30% 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(270 15% 60%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(270 15% 60%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(13, 10, 20, 0.9)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "1rem",
                fontSize: "12px",
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
              }}
              formatter={(value: number) => `${value}€`}
            />
            <Area
              type="monotone"
              dataKey="revenus"
              stroke="hsl(270 89% 66%)"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              dot={{
                fill: "hsl(270 89% 66%)",
                r: 4,
                strokeWidth: 2,
                stroke: "hsl(270 89% 66%)",
              }}
              activeDot={{
                r: 6,
                fill: "hsl(270 89% 66%)",
                strokeWidth: 2,
                stroke: "#fff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
