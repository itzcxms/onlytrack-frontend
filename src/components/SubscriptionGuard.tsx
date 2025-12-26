// ==========================================
// SUBSCRIPTION GUARD COMPONENT
// Vérifie que l'abonnement est actif avant d'afficher le contenu
// ==========================================

import { ReactNode, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionGuardProps {
  children: ReactNode;
}

interface SubscriptionStatus {
  plan: string;
  status: string;
  isPremium: boolean;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  // Si c'est un utilisateur démo, bypasser la vérification
  const isDemo = (user as any)?.isDemo === true;

  // Mutation pour vérifier le paiement après retour de Stripe
  const verifyPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/verify-payment", {
        method: "POST",
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success && data.plan === "premium") {
        toast({
          title: "🎉 Abonnement Premium activé !",
          description: "Bienvenue ! Vous avez maintenant accès à toutes les fonctionnalités.",
        });
        // Rafraîchir les données d'abonnement
        queryClient.invalidateQueries({ queryKey: ["/api/stripe/status"] });
      }
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/");
      setIsVerifying(false);
    },
    onError: () => {
      setIsVerifying(false);
      window.history.replaceState({}, "", "/");
    },
  });

  // Vérifier le paiement si success=true dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true" && !isVerifying && !verifyPaymentMutation.isPending) {
      setIsVerifying(true);
      verifyPaymentMutation.mutate();
    }
  }, []);

  // Vérifier le statut d'abonnement (sauf pour les utilisateurs démo)
  const { data: subscription, isLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/status"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/status", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors de la vérification");
      return res.json();
    },
    staleTime: 60000, // Cache pendant 1 minute
    retry: false,
    enabled: !isDemo, // Ne pas vérifier pour les utilisateurs démo
  });

  // Nettoyer l'URL si on n'a pas accès (enlever le path)
  useEffect(() => {
    if (subscription && !subscription.isPremium && location !== "/") {
      window.history.replaceState({}, "", "/");
    }
  }, [subscription, location]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  // Utilisateurs démo - accès complet sans vérification
  if (isDemo) {
    return <>{children}</>;
  }

  // Si on vérifie le paiement, afficher le loader
  if (isVerifying || verifyPaymentMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Vérification de votre paiement...</p>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Erreur de chargement - on laisse passer quand même
  if (error) {
    console.error("Erreur vérification abonnement:", error);
    return <>{children}</>;
  }

  // Abonnement actif ou pas de données - on laisse passer
  if (!subscription || subscription.isPremium) {
    return <>{children}</>;
  }

  // Compte suspendu (paiement échoué)
  if (subscription.status === "suspendu") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-red-500/5">
        <Card className="glass-card border-red-500/30 rounded-3xl max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl">Paiement en attente</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Votre dernier paiement a échoué. Veuillez mettre à jour vos
              informations de paiement pour continuer à utiliser OnlyTrack.
            </p>
            <p className="text-sm text-muted-foreground">
              Vos données sont préservées et seront disponibles dès que votre
              abonnement sera réactivé.
            </p>
            <Button
              onClick={async () => {
                try {
                  const res = await fetch("/api/stripe/portal", {
                    method: "POST",
                    credentials: "include",
                  });
                  const { url } = await res.json();
                  window.location.href = url;
                } catch {
                  setLocation("/pricing");
                }
              }}
              className="w-full rounded-xl neon-glow"
            >
              Gérer mon abonnement
            </Button>

            {/* Bouton de déconnexion */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pas d'abonnement actif (free ou annulé)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="glass-card border-primary/30 rounded-3xl max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Passez à Premium</CardTitle>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              Connecté en tant que {user.email}
            </p>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Pour accéder à toutes les fonctionnalités d'OnlyTrack, vous avez
            besoin d'un abonnement Premium.
          </p>

          <ul className="text-left text-sm space-y-2 bg-primary/5 rounded-xl p-4">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Analytics connectés (TikTok, Instagram)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Assistant IA illimité
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Support prioritaire
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              3 jours d'essai gratuit
            </li>
          </ul>

          <Button
            onClick={() => setLocation("/pricing")}
            className="w-full rounded-xl neon-glow"
          >
            Voir les tarifs
          </Button>

          <p className="text-xs text-muted-foreground">
            Essayez gratuitement pendant 3 jours, annulez quand vous voulez.
          </p>

          {/* Bouton de déconnexion */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

