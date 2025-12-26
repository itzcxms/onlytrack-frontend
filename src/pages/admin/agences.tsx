// ==========================================
// ADMIN - GESTION DES AGENCES
// Liste et modification des agences
// ==========================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Crown,
  Building2,
  FlaskConical,
} from "lucide-react";

interface Agence {
  id: string;
  nom: string;
  plan: string;
  demo: boolean;
  statutAbonnement: string | null;
  dateCreation: string;
  idAbonnementStripe: string | null;
}

export default function AdminAgences() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agences, isLoading } = useQuery<Agence[]>({
    queryKey: ["/api/admin/agences"],
    queryFn: async () => {
      const res = await fetch("/api/admin/agences", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement agences");
      return res.json();
    },
  });

  const updateAgence = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; plan?: string; demo?: boolean }) => {
      const res = await fetch(`/api/admin/agences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Agence mise à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier l'agence", variant: "destructive" });
    },
  });

  const filteredAgences = agences?.filter((a) =>
    a.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Agences</h1>
            <p className="text-muted-foreground">
              {agences?.length || 0} agences enregistrées
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une agence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agence</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Demo</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgences?.map((agence) => (
                    <TableRow key={agence.id} className={agence.demo ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            agence.demo ? "bg-yellow-500/20" : "bg-primary/10"
                          }`}>
                            {agence.demo ? (
                              <FlaskConical className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Building2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{agence.nom}</span>
                            {agence.demo && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">DEMO</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {agence.plan === "premium" ? (
                            <>
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span className="text-primary font-medium">Premium</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Free</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          agence.statutAbonnement === "actif" 
                            ? "bg-green-500/20 text-green-400"
                            : agence.statutAbonnement === "suspendu"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {agence.statutAbonnement || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={agence.demo}
                          onCheckedChange={(checked) => updateAgence.mutate({ id: agence.id, demo: checked })}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(agence.dateCreation).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={agence.plan}
                          onValueChange={(value) => updateAgence.mutate({ id: agence.id, plan: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
