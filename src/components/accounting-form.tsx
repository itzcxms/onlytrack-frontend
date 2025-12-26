import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Check } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AccountingForm() {
  const { toast } = useToast();
  const [newAmount, setNewAmount] = useState("");

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const createMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest("/api/transactions", "POST", {
        amount,
        paid: false,
        workspaceId: "demo-workspace",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/revenue"] });
      setNewAmount("");
      toast({
        title: "Transaction ajoutée",
        description: "La transaction a été enregistrée avec succès.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      return apiRequest(`/api/transactions/${id}`, "PATCH", { paid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });

  const handleAddEntry = () => {
    if (newAmount) {
      createMutation.mutate(parseFloat(newAmount));
    }
  };

  const togglePaid = (id: string, paid: boolean) => {
    updateMutation.mutate({ id, paid: !paid });
  };

  const handleExportCSV = () => {
    toast({
      title: "Export CSV",
      description: "La fonctionnalité d'export sera bientôt disponible.",
    });
  };

  return (
    <Card
      className="backdrop-blur-md bg-black/20 border-violet-500/20"
      data-testid="card-accounting"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Comptabilité</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Saisir un montant..."
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="bg-black/40 border-violet-500/30"
              data-testid="input-amount"
            />
          </div>
          <Button
            onClick={handleAddEntry}
            className="mt-6"
            data-testid="button-add-entry"
            disabled={createMutation.isPending}
          >
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {transactions.map((transaction: any) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-violet-500/10"
              data-testid={`transaction-${transaction.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
              <div className="font-display text-lg text-primary mr-4">
                {transaction.amount.toLocaleString("fr-FR")} €
              </div>
              <Button
                variant={transaction.paid ? "default" : "outline"}
                size="sm"
                onClick={() => togglePaid(transaction.id, transaction.paid)}
                data-testid={`button-toggle-paid-${transaction.id}`}
                disabled={updateMutation.isPending}
              >
                {transaction.paid ? <Check className="w-4 h-4 mr-2" /> : null}
                {transaction.paid ? "Payé" : "Marquer payé"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
