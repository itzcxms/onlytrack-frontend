import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/stat-card";
import {
  Plus,
  DollarSign,
  Users as UsersIcon,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Modele, Transaction } from "@shared/schema";

export default function Accounting() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>("all");
  const [chartPeriod, setChartPeriod] = useState<"7" | "30" | "90" | "custom">(
    "30",
  );
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [formData, setFormData] = useState({
    modelId: "",
    amount: "",
    subscriptions: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { data: models = [] } = useQuery<Modele[]>({
    queryKey: ["/api/models"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const amount = parseFloat(data.amount);
      const subscriptions = parseInt(data.subscriptions);
      if (isNaN(amount) || isNaN(subscriptions)) {
        throw new Error("Montant ou abonnements invalide");
      }
      if (!data.date) {
        throw new Error("Date requise");
      }
      return apiRequest("/api/transactions", "POST", {
        modeleId: data.modelId || null,
        montant: amount,
        abonnements: subscriptions,
        date: data.date,
        paye: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Résultat ajouté",
        description: "Le résultat journalier a été enregistré avec succès.",
      });
      setModalOpen(false);
      setFormData({
        modelId: "",
        amount: "",
        subscriptions: "",
        date: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le résultat",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const applyCustomDates = () => {
    if (customStart && customEnd) {
      setChartPeriod("custom");
      setCustomDialogOpen(false);
    }
  };

  // Filter transactions by model
  const filteredTransactions =
    selectedModelFilter === "all"
      ? transactions
      : transactions.filter(
          (t) => t.modeleId?.toString() === selectedModelFilter,
        );

  // Calculate stats
  const totalRevenue = filteredTransactions.reduce(
    (sum, t) => sum + t.montant,
    0,
  );
  const totalSubs = filteredTransactions.reduce(
    (sum, t) => sum + (t.abonnements || 0),
    0,
  );
  const avgRevenue =
    filteredTransactions.length > 0
      ? totalRevenue / filteredTransactions.length
      : 0;

  // Determine number of days for chart
  const getDaysForChart = () => {
    if (chartPeriod === "7") return 7;
    if (chartPeriod === "30") return 30;
    if (chartPeriod === "90") return 90;
    if (chartPeriod === "custom" && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return Math.max(1, diff + 1);
    }
    return 30;
  };

  // Prepare chart data
  const days = getDaysForChart();
  const chartData = Array.from({ length: days }, (_, i) => {
    let date: Date;
    if (chartPeriod === "custom" && customStart) {
      date = new Date(customStart);
      date.setDate(date.getDate() + i);
    } else {
      date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
    }

    const dayTransactions = filteredTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === date.toDateString();
    });
    const revenue = dayTransactions.reduce((sum, t) => sum + t.montant, 0);
    return {
      date: date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Comptabilité
          </h1>
          <p className="text-muted-foreground">
            Suivi des revenus et paiements
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="button-add-daily-result"
              className="rounded-xl neon-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Daily Result
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display gradient-text">
                Ajouter un résultat journalier
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Select
                  value={formData.modelId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, modelId: value })
                  }
                >
                  <SelectTrigger
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="select-model"
                  >
                    <SelectValue placeholder="Sélectionner un modèle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="rounded-xl bg-black/40 border-primary/20"
                  data-testid="input-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Revenus (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  className="rounded-xl bg-black/40 border-primary/20"
                  data-testid="input-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Abonnements</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.subscriptions}
                  onChange={(e) =>
                    setFormData({ ...formData, subscriptions: e.target.value })
                  }
                  required
                  className="rounded-xl bg-black/40 border-primary/20"
                  data-testid="input-subscriptions"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl neon-glow"
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Model */}
      <Card className="glass-card rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">Filtrer par modèle:</Label>
            <Select
              value={selectedModelFilter}
              onValueChange={setSelectedModelFilter}
            >
              <SelectTrigger
                className="rounded-xl bg-black/40 border-primary/20 max-w-xs"
                data-testid="select-filter-model"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modèles</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Revenus totaux"
          value={`${totalRevenue.toLocaleString()} €`}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="bg-primary/20 text-primary"
        />
        <StatCard
          title="Abonnements"
          value={totalSubs.toLocaleString()}
          icon={<UsersIcon className="w-5 h-5" />}
          iconColor="bg-primary/20 text-primary"
        />
        <StatCard
          title="Revenus moyens/jour"
          value={`${avgRevenue.toFixed(0)} €`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="bg-primary/20 text-primary"
        />
      </div>

      {/* Revenue Chart */}
      <Card className="glass-card rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="font-display gradient-text">
              Évolution des revenus
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={chartPeriod === "7" ? "default" : "secondary"}
                size="sm"
                onClick={() => setChartPeriod("7")}
                data-testid="button-chart-7days"
                className="text-xs rounded-xl"
              >
                7 jours
              </Button>
              <Button
                variant={chartPeriod === "30" ? "default" : "secondary"}
                size="sm"
                onClick={() => setChartPeriod("30")}
                data-testid="button-chart-30days"
                className="text-xs rounded-xl"
              >
                30 jours
              </Button>
              <Button
                variant={chartPeriod === "90" ? "default" : "secondary"}
                size="sm"
                onClick={() => setChartPeriod("90")}
                data-testid="button-chart-90days"
                className="text-xs rounded-xl"
              >
                90 jours
              </Button>
              <Dialog
                open={customDialogOpen}
                onOpenChange={setCustomDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant={chartPeriod === "custom" ? "default" : "secondary"}
                    size="sm"
                    data-testid="button-chart-custom"
                    className="text-xs rounded-xl"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Custom
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
                      <Label htmlFor="chart-start-date">Date de début</Label>
                      <Input
                        id="chart-start-date"
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        data-testid="input-chart-custom-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chart-end-date">Date de fin</Label>
                      <Input
                        id="chart-end-date"
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        data-testid="input-chart-custom-end"
                      />
                    </div>
                    <Button
                      onClick={applyCustomDates}
                      className="w-full"
                      data-testid="button-chart-apply-custom"
                      disabled={!customStart || !customEnd}
                    >
                      Appliquer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(270 89% 66%)"
                strokeWidth={3}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
