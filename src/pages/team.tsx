import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Users,
  TrendingUp,
  CheckSquare,
  Plus,
  Percent,
  Network,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MembreEquipe } from "@shared/schema";
import { OrganizationChart } from "@/components/organization-chart";

export default function Team() {
  const [selectedMember, setSelectedMember] = useState<MembreEquipe | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<"member" | "model">("member");
  const [viewMode, setViewMode] = useState<"circular" | "hierarchy">(
    "circular",
  );
  const { toast } = useToast();

  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ["/api/equipe"],
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: {
      prenom: string;
      nom: string;
      email: string;
      motDePasse: string;
      role: "member" | "model";
    }) => {
      return apiRequest("/api/equipe/creer", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipe"] });
      setAddModalOpen(false);
      setPrenom("");
      setNom("");
      setEmail("");
      setMotDePasse("");
      setRole("member");
      toast({
        title: "Membre créé",
        description:
          "Le nouveau membre peut maintenant se connecter avec son email et mot de passe",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le membre",
        variant: "destructive",
      });
    },
  });

  const handleAddMember = () => {
    if (!prenom.trim() || !nom.trim() || !email.trim() || !motDePasse.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (motDePasse.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    createMemberMutation.mutate({
      prenom,
      nom,
      email,
      motDePasse,
      role,
    });
  };

  const getCEO = () => teamMembers.find((m: any) => !m.managerId);
  const getDirectReports = (managerId: string) =>
    teamMembers.filter((m: any) => m.managerId === managerId);

  const renderMemberCard = (member: any, level: number = 0) => {
    const directReports = getDirectReports(member.id);
    const isSelected = selectedMember?.id === member.id;

    return (
      <div key={member.id} className="flex flex-col items-center">
        <Card
          className={`glass-card rounded-3xl cursor-pointer transition-all w-64 ${
            isSelected ? "neon-border" : ""
          }`}
          onClick={() => setSelectedMember(member)}
          data-testid={`card-team-member-${member.id}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={member.urlPhoto || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-display">
                  {member.initiales}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg truncate">
                  {member.nom}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {member.role}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>{member.revenus?.toLocaleString() || 0} €</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Percent className="w-4 h-4 text-primary" />
                <span>{member.pourcentage || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {directReports.length > 0 && (
          <div className="relative mt-8">
            <div className="absolute left-1/2 -top-8 w-px h-8 bg-primary/30" />
            <div className="flex gap-8 relative">
              {directReports.map((report, index) => (
                <div key={report.id} className="relative">
                  {index > 0 && (
                    <div className="absolute top-0 -left-4 h-px w-4 bg-primary/30" />
                  )}
                  <div className="absolute left-1/2 -top-8 w-px h-8 bg-primary/30" />
                  {renderMemberCard(report, level + 1)}
                </div>
              ))}
              {directReports.length > 1 && (
                <div
                  className="absolute top-0 left-0 right-0 h-px bg-primary/30"
                  style={{ top: "-32px" }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ceo = getCEO();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Équipe
          </h1>
          <p className="text-muted-foreground">
            Organisation et performances de l'équipe
          </p>
        </div>
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-xl neon-glow"
              data-testid="button-add-member"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un membre
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display gradient-text">
                Ajouter un membre
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Créer un nouveau compte utilisateur pour ce membre
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member-prenom">Prénom</Label>
                  <Input
                    id="member-prenom"
                    placeholder="Ex: Marie"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="rounded-xl bg-black/40 border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-nom">Nom</Label>
                  <Input
                    id="member-nom"
                    placeholder="Ex: Dupont"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="rounded-xl bg-black/40 border-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="marie.dupont@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl bg-black/40 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-password">Mot de passe</Label>
                <Input
                  id="member-password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="rounded-xl bg-black/40 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-role-select">Rôle</Label>
                <select
                  id="member-role-select"
                  className="w-full rounded-xl bg-black/40 border border-primary/20 px-3 py-2 text-sm"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "member" | "model")
                  }
                >
                  <option value="member">Member (Accès complet)</option>
                  <option value="model">Model (Accès limité)</option>
                </select>
              </div>

              <Button
                className="w-full rounded-xl neon-glow"
                onClick={handleAddMember}
                disabled={createMemberMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {createMemberMutation.isPending
                  ? "Création..."
                  : "Créer le compte"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display gradient-text flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Organigramme
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "circular" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("circular")}
                    data-testid="button-view-circular"
                    className="rounded-xl"
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Circulaire
                  </Button>
                  <Button
                    variant={viewMode === "hierarchy" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("hierarchy")}
                    data-testid="button-view-hierarchy"
                    className="rounded-xl"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Hiérarchie
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Aucun membre trouvé
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setAddModalOpen(true)}
                    data-testid="button-add-first-member"
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le premier membre
                  </Button>
                </div>
              ) : viewMode === "circular" ? (
                <OrganizationChart
                  members={teamMembers}
                  onMemberClick={setSelectedMember}
                  selectedMemberId={selectedMember?.id}
                />
              ) : (
                <div className="overflow-x-auto pb-8">
                  <div className="flex justify-center min-w-max p-8">
                    {ceo && renderMemberCard(ceo)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card rounded-3xl sticky top-8">
            <CardHeader>
              <CardTitle className="font-display gradient-text">
                Détails
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={selectedMember.urlPhoto || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-display text-2xl">
                        {selectedMember.initiales}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-display font-bold text-xl mb-1">
                        {selectedMember.nom}
                      </h3>
                      <Badge variant="secondary" className="rounded-xl">
                        {selectedMember.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Revenus générés
                        </span>
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-display text-2xl font-bold gradient-text">
                        {selectedMember.revenus?.toLocaleString() || 0} €
                      </p>
                    </div>

                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Pourcentage
                        </span>
                        <Percent className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-display text-2xl font-bold gradient-text">
                        {selectedMember.pourcentage || 0}%
                      </p>
                    </div>

                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Tâches en cours
                        </span>
                        <CheckSquare className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-display text-2xl font-bold gradient-text">
                        {selectedMember.taches || 0}
                      </p>
                    </div>

                    {selectedMember.managerId && (
                      <div className="glass-card rounded-2xl p-4">
                        <span className="text-sm text-muted-foreground block mb-2">
                          Manager
                        </span>
                        <p className="font-medium">
                          {teamMembers.find(
                            (m) => m.id === selectedMember.managerId,
                          )?.nom || "N/A"}
                        </p>
                      </div>
                    )}

                    {getDirectReports(selectedMember.id).length > 0 && (
                      <div className="glass-card rounded-2xl p-4">
                        <span className="text-sm text-muted-foreground block mb-2">
                          Équipe ({getDirectReports(selectedMember.id).length})
                        </span>
                        <div className="space-y-2">
                          {getDirectReports(selectedMember.id).map((report) => (
                            <div
                              key={report.id}
                              className="flex items-center gap-2 text-sm cursor-pointer hover-elevate rounded-xl p-2"
                              onClick={() => setSelectedMember(report)}
                              data-testid={`link-team-member-${report.id}`}
                            >
                              <Avatar className="w-6 h-6">
                                <AvatarImage
                                  src={report.urlPhoto || undefined}
                                />
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                  {report.initiales}
                                </AvatarFallback>
                              </Avatar>
                              <span>{report.nom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Sélectionnez un membre de l'équipe pour voir ses détails
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
