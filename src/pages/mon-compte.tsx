// ==========================================
// PAGE MON COMPTE
// Affiche les informations utilisateur et l'abonnement
// ==========================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  User,
  Mail,
  Building2,
  Crown,
  CreditCard,
  Loader2,
  Calendar,
  Shield,
  ExternalLink,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface AccountData {
  user: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    role: string;
    agenceId: string;
  };
  agence: {
    nom: string;
    plan: string;
    statutAbonnement: string;
    dateCreation: string;
  } | null;
}

export default function MonCompte() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // État pour l'édition du profil
  const [isEditing, setIsEditing] = useState(false);
  const [editPrenom, setEditPrenom] = useState("");
  const [editNom, setEditNom] = useState("");

  // Récupérer les infos complètes du compte
  const { data: accountData, isLoading: loadingAccount } = useQuery<AccountData>({
    queryKey: ["/api/auth/compte"],
  });

  // Récupérer le statut d'abonnement
  const { data: subscriptionData, isLoading: loadingSubscription } = useQuery<{
    plan: string;
    status: string;
    isPremium: boolean;
  }>({
    queryKey: ["/api/stripe/status"],
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { prenom: string; nom: string }) => {
      const res = await fetch("/api/auth/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/compte"] });
      refreshUser();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour accéder au portail Stripe
  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de l'accès au portail");
      }
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Démarrer l'édition
  function startEditing() {
    if (accountData?.user) {
      setEditPrenom(accountData.user.prenom);
      setEditNom(accountData.user.nom);
      setIsEditing(true);
    }
  }

  // Sauvegarder les modifications
  function saveProfile() {
    updateProfileMutation.mutate({ prenom: editPrenom, nom: editNom });
  }

  // Annuler l'édition
  function cancelEditing() {
    setIsEditing(false);
  }

  // Formater le rôle
  function formatRole(role: string) {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "member":
        return "Membre";
      case "model":
        return "Modèle";
      default:
        return role;
    }
  }

  // Formater le statut d'abonnement
  function formatSubscriptionStatus(status: string) {
    switch (status) {
      case "actif":
        return { label: "Actif", color: "bg-green-500/20 text-green-400 border-green-500/30" };
      case "annule":
        return { label: "Annulé", color: "bg-red-500/20 text-red-400 border-red-500/30" };
      case "expire":
        return { label: "Expiré", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
      default:
        return { label: status, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    }
  }

  if (!user) {
    return null;
  }

  const subscriptionStatus = subscriptionData?.status
    ? formatSubscriptionStatus(subscriptionData.status)
    : null;

  return (
    <div className="space-y-8">
      {/* Header avec nom de l'agence */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-display font-bold text-foreground">
            Mon Compte
          </h1>
          {accountData?.agence && (
            <Badge variant="outline" className="text-sm">
              <Building2 className="w-3 h-3 mr-1" />
              {accountData.agence.nom}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et votre abonnement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card className="glass-card rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Informations personnelles</CardTitle>
              </div>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startEditing}
                  className="rounded-xl"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingAccount ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : isEditing ? (
              /* Mode édition */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={editPrenom}
                    onChange={(e) => setEditPrenom(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={saveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="rounded-xl flex-1"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    className="rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Mode affichage */
              <>
                {/* Prénom et Nom */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">
                      {accountData?.user?.prenom} {accountData?.user?.nom}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{accountData?.user?.email}</p>
                  </div>
                </div>

                {/* Rôle */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <p className="font-medium">
                      {formatRole(accountData?.user?.role || "")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Abonnement */}
        <Card className="glass-card rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Abonnement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingSubscription ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Agence */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Agence</p>
                    <p className="font-medium">
                      {accountData?.agence?.nom || "—"}
                    </p>
                  </div>
                </div>

                {/* Plan actuel */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Crown className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Plan actuel</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">
                        {subscriptionData?.plan || "Free"}
                      </p>
                      {subscriptionData?.isPremium && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <div className="flex items-center gap-2">
                      {subscriptionStatus && (
                        <Badge className={subscriptionStatus.color}>
                          {subscriptionStatus.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Boutons d'action */}
                {subscriptionData?.isPremium ? (
                  <Button
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                    className="w-full rounded-xl"
                    variant="outline"
                  >
                    {portalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gérer mon abonnement
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setLocation("/pricing")}
                    className="w-full rounded-xl neon-glow"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Passer à Premium
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
