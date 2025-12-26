// ==========================================
// ADMIN - GESTION DES UTILISATEURS
// Liste et modification des utilisateurs
// ==========================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  User,
  Crown,
  UserCheck,
  FlaskConical,
} from "lucide-react";

interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  agenceId: string;
  agenceNom?: string;
  agenceDemo?: boolean;
  emailVerifie: boolean;
  actif: boolean;
  dateCreation: string;
  derniereConnexion: string | null;
}

export default function AdminUtilisateurs() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users and agencies
  const { data: utilisateurs, isLoading } = useQuery<Utilisateur[]>({
    queryKey: ["/api/admin/utilisateurs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/utilisateurs", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement utilisateurs");
      return res.json();
    },
  });

  const { data: agences } = useQuery<{id: string; nom: string; demo: boolean}[]>({
    queryKey: ["/api/admin/agences"],
    queryFn: async () => {
      const res = await fetch("/api/admin/agences", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement agences");
      return res.json();
    },
  });

  // Map users with agency info
  const usersWithAgency = utilisateurs?.map(user => {
    const agence = agences?.find(a => a.id === user.agenceId);
    return {
      ...user,
      agenceNom: agence?.nom || "Inconnue",
      agenceDemo: agence?.demo || false,
    };
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; role?: string; actif?: boolean }) => {
      const res = await fetch(`/api/admin/utilisateurs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/utilisateurs"] });
      toast({ title: "Utilisateur mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier l'utilisateur", variant: "destructive" });
    },
  });

  const filteredUsers = usersWithAgency?.filter((u) =>
    `${u.prenom} ${u.nom} ${u.email} ${u.agenceNom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            {utilisateurs?.length || 0} utilisateurs enregistrés
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
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
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id} className={user.agenceDemo ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            user.agenceDemo ? "bg-yellow-500/20" : "bg-primary/10"
                          }`}>
                            {user.agenceDemo ? (
                              <FlaskConical className="w-4 h-4 text-yellow-500" />
                            ) : user.role === "owner" ? (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {user.prenom} {user.nom}
                              </span>
                              {user.agenceDemo && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">DEMO</span>
                              )}
                              {user.emailVerifie && (
                                <UserCheck className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.agenceNom}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUser.mutate({ id: user.id, role: value })}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="model">Model</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.actif}
                          onCheckedChange={(checked) => updateUser.mutate({ id: user.id, actif: checked })}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.derniereConnexion
                          ? new Date(user.derniereConnexion).toLocaleString("fr-FR")
                          : "Jamais"}
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
