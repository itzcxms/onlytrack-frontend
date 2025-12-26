// ==========================================
// GESTION DES ACCÈS TEMPORAIRES
// Interface pour créer et gérer les accès temporaires
// ==========================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
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
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Link2,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccesTemporaire {
  id: string;
  nom: string;
  email: string | null;
  token: string;
  dateCreation: string;
  dateExpiration: string | null;
  actif: boolean;
}

export default function AccesTemporaires() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [joursValidite, setJoursValidite] = useState("7");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: acces, isLoading } = useQuery<AccesTemporaire[]>({
    queryKey: ["/api/acces-temporaires"],
    queryFn: async () => {
      const res = await fetch("/api/acces-temporaires", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement");
      return res.json();
    },
  });

  const createAcces = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/acces-temporaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nom, email: email || null, joursValidite: parseInt(joursValidite) }),
      });
      if (!res.ok) throw new Error("Erreur création");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/acces-temporaires"] });
      setIsCreateOpen(false);
      setNom("");
      setEmail("");
      
      // Copier le lien dans le presse-papier
      const lien = `${window.location.origin}${data.lien}`;
      navigator.clipboard.writeText(lien);
      
      toast({ 
        title: "Accès créé !", 
        description: "Le lien a été copié dans le presse-papier" 
      });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer l'accès", variant: "destructive" });
    },
  });

  const revokeAcces = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/acces-temporaires/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur révocation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acces-temporaires"] });
      toast({ title: "Accès révoqué" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de révoquer l'accès", variant: "destructive" });
    },
  });

  const copyLink = (token: string) => {
    const lien = `${window.location.origin}/acces/${token}`;
    navigator.clipboard.writeText(lien);
    toast({ title: "Lien copié !", description: "Le lien a été copié dans le presse-papier" });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Accès Temporaires</h1>
            <p className="text-muted-foreground">
              Créez des liens d'accès pour vos clients ou influenceurs
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Créer un accès
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvel accès temporaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Client XYZ"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="jours">Durée de validité (jours)</Label>
                  <Input
                    id="jours"
                    type="number"
                    min="1"
                    max="365"
                    value={joursValidite}
                    onChange={(e) => setJoursValidite(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => createAcces.mutate()}
                  disabled={!nom || createAcces.isPending}
                  className="w-full rounded-xl"
                >
                  {createAcces.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'accès"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Liste des accès */}
        <Card className="glass-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !acces || acces.length === 0 ? (
              <div className="text-center py-20">
                <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun accès temporaire créé
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acces.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nom}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.email || "-"}
                      </TableCell>
                      <TableCell>
                        {item.actif ? (
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">Actif</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Révoqué</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.dateExpiration
                          ? new Date(item.dateExpiration).toLocaleDateString("fr-FR")
                          : "Jamais"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.actif && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLink(item.token)}
                              title="Copier le lien"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          {item.actif && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => revokeAcces.mutate(item.id)}
                              title="Révoquer l'accès"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
