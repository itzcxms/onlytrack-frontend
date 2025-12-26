// ==========================================
// ADMIN - GESTION DES ACCÈS TEMPORAIRES
// Créer et gérer des accès démo pour les clients
// ==========================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Plus,
  Link as LinkIcon,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";

interface AccesTemporaire {
  id: string;
  agenceId: string;
  agenceNom?: string;
  nom: string;
  email: string | null;
  token: string;
  dateCreation: string;
  dateExpiration: string | null;
  actif: boolean;
}

interface Agence {
  id: string;
  nom: string;
  demo: boolean;
}

export default function AdminAccesTemporaires() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAgenceId, setSelectedAgenceId] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [duree, setDuree] = useState("7"); // jours
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer la liste des agences
  const { data: agences } = useQuery<Agence[]>({
    queryKey: ["/api/admin/agences"],
    queryFn: async () => {
      const res = await fetch("/api/admin/agences", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  // Récupérer tous les accès temporaires
  const { data: acces, isLoading } = useQuery<AccesTemporaire[]>({
    queryKey: ["/api/admin/acces-temporaires"],
    queryFn: async () => {
      const res = await fetch("/api/admin/acces-temporaires", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement");
      return res.json();
    },
  });

  // Mutation pour créer un accès
  const createAcces = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/acces-temporaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          agenceId: selectedAgenceId,
          nom,
          email: email || null,
          dureeJours: parseInt(duree),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur création");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/acces-temporaires"] });
      setIsCreateOpen(false);
      setNom("");
      setEmail("");
      setSelectedAgenceId("");
      
      // Copier le lien automatiquement
      const link = `${window.location.origin}/demo/${data.token}`;
      navigator.clipboard.writeText(link);
      
      toast({ 
        title: "Accès créé !",
        description: "Le lien a été copié dans le presse-papier.",
      });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  // Mutation pour révoquer un accès
  const revokeAcces = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/acces-temporaires/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur révocation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/acces-temporaires"] });
      toast({ title: "Accès révoqué" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de révoquer l'accès", variant: "destructive" });
    },
  });

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/demo/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Lien copié !" });
  };

  // Ajouter le nom de l'agence aux accès
  const accesWithAgence = acces?.map(a => ({
    ...a,
    agenceNom: agences?.find(ag => ag.id === a.agenceId)?.nom || "Inconnue",
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Accès Temporaires</h1>
            <p className="text-muted-foreground">
              Créer des liens de démo pour les clients potentiels
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau lien
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un accès temporaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agence de démo</Label>
                  <Select value={selectedAgenceId} onValueChange={setSelectedAgenceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agences?.filter(a => a.demo).map((agence) => (
                        <SelectItem key={agence.id} value={agence.id}>
                          {agence.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Seules les agences marquées "DEMO" sont disponibles
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du client</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Jean Dupont - Agence XYZ"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Durée de validité</Label>
                  <Select value={duree} onValueChange={setDuree}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 jour</SelectItem>
                      <SelectItem value="3">3 jours</SelectItem>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="14">14 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => createAcces.mutate()}
                  disabled={createAcces.isPending || !selectedAgenceId || !nom}
                  className="w-full rounded-xl neon-glow"
                >
                  {createAcces.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4 mr-2" />
                  )}
                  Créer le lien
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {acces?.filter(a => a.actif).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Liens actifs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {acces?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total créés</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {acces?.filter(a => !a.actif).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Révoqués</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Liens de démo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !accesWithAgence || accesWithAgence.length === 0 ? (
              <div className="text-center py-20">
                <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun lien créé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accesWithAgence.map((item) => {
                    const isExpired = item.dateExpiration && new Date(item.dateExpiration) < new Date();
                    const isActive = item.actif && !isExpired;
                    
                    return (
                      <TableRow key={item.id} className={!isActive ? "opacity-50" : ""}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{item.nom}</span>
                            {item.email && (
                              <p className="text-xs text-muted-foreground">{item.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.agenceNom}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3 h-3" />
                            {item.dateExpiration
                              ? new Date(item.dateExpiration).toLocaleDateString("fr-FR")
                              : "Illimité"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isActive
                              ? "bg-green-500/20 text-green-400"
                              : isExpired
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {isActive ? "Actif" : isExpired ? "Expiré" : "Révoqué"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLink(item.token)}
                              disabled={!isActive}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/demo/${item.token}`, "_blank")}
                              disabled={!isActive}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            {item.actif && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => revokeAcces.mutate(item.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
