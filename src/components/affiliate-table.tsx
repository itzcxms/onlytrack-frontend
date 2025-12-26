import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Link as LinkIcon, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Affilie } from "@shared/schema";

export function AffiliateTable() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affilie | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    commission: "",
    link: "",
  });

  const { data: affiliates = [] } = useQuery<Affilie[]>({
    queryKey: ["/api/affiliates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const commission = parseFloat(data.commission);
      if (isNaN(commission)) {
        throw new Error("Commission invalide");
      }
      return apiRequest("/api/affiliates", "POST", {
        nom: data.name,
        lien: data.link,
        commission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
      toast({
        title: "Lien créé",
        description: "Le lien d'affiliation a été créé avec succès.",
      });
      setModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le lien",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const commission = parseFloat(data.commission);
      if (isNaN(commission)) {
        throw new Error("Commission invalide");
      }
      return apiRequest(`/api/affiliates/${id}`, "PATCH", {
        nom: data.name,
        lien: data.link,
        commission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
      toast({
        title: "Lien modifié",
        description: "Le lien d'affiliation a été modifié avec succès.",
      });
      setModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le lien",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/affiliates/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
      toast({
        title: "Lien supprimé",
        description: "Le lien d'affiliation a été supprimé.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le lien",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", commission: "", link: "" });
    setEditingAffiliate(null);
  };

  const handleOpenModal = (affiliate?: Affilie) => {
    if (affiliate) {
      setEditingAffiliate(affiliate);
      setFormData({
        name: affiliate.nom,
        commission: affiliate.commission.toString(),
        link: affiliate.lien,
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAffiliate) {
      updateMutation.mutate({ id: editingAffiliate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const conversionRate = (conversions: number, clicks: number) => {
    if (clicks === 0) return "0.0";
    return ((conversions / clicks) * 100).toFixed(1);
  };

  return (
    <Card className="glass-card rounded-3xl" data-testid="card-affiliate-table">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="font-display gradient-text">
            Tracking Links
          </CardTitle>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenModal()}
                data-testid="button-create-link"
                className="rounded-xl neon-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display gradient-text">
                  {editingAffiliate ? "Modifier le lien" : "Créer un lien"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom de l'affilié</Label>
                  <Input
                    placeholder="ex: John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-affiliate-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="ex: 15.5"
                    value={formData.commission}
                    onChange={(e) =>
                      setFormData({ ...formData, commission: e.target.value })
                    }
                    required
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-commission"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lien de tracking</Label>
                  <Input
                    placeholder="ex: https://track.example.com/abc123"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    required
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-tracking-link"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl neon-glow"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  data-testid="button-submit-affiliate"
                >
                  {editingAffiliate ? "Modifier" : "Créer"} le lien
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left py-3 px-4 font-display text-sm text-muted-foreground">
                  Nom
                </th>
                <th className="text-left py-3 px-4 font-display text-sm text-muted-foreground">
                  Lien
                </th>
                <th className="text-right py-3 px-4 font-display text-sm text-muted-foreground">
                  Commission
                </th>
                <th className="text-right py-3 px-4 font-display text-sm text-muted-foreground">
                  Clics
                </th>
                <th className="text-right py-3 px-4 font-display text-sm text-muted-foreground">
                  Conversions
                </th>
                <th className="text-right py-3 px-4 font-display text-sm text-muted-foreground">
                  Taux
                </th>
                <th className="text-right py-3 px-4 font-display text-sm text-muted-foreground">
                  Revenus
                </th>
                <th className="text-right py-3 px-4 font-display text-sm text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Aucun lien d'affiliation. Créez-en un pour commencer.
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => (
                  <tr
                    key={affiliate.id}
                    className="border-b border-primary/10 hover:bg-white/5 transition-colors"
                    data-testid={`row-affiliate-${affiliate.id}`}
                  >
                    <td className="py-3 px-4 font-medium">{affiliate.nom}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">
                          {affiliate.lien}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="secondary" className="rounded-xl">
                        {affiliate.commission}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-display">
                      {affiliate.clics.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-display">
                      {affiliate.conversions}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="secondary" className="rounded-xl">
                        {conversionRate(affiliate.conversions, affiliate.clics)}
                        %
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-display text-primary">
                      {affiliate.revenus.toLocaleString()} €
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenModal(affiliate)}
                          data-testid={`button-edit-${affiliate.id}`}
                          className="rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(affiliate.id)}
                          data-testid={`button-delete-${affiliate.id}`}
                          className="rounded-xl text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
