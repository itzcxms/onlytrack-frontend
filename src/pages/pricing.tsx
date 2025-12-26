// ==========================================
// PAGE PRICING / ABONNEMENTS
// Landing page avec les plans d'abonnement
// ==========================================

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Sparkles,
  Rocket,
  Loader2,
  ArrowLeft,
  Calendar,
  MessageCircle,
  BarChart3,
  Bot,
  Headphones,
} from "lucide-react";

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Gérer le clic sur le bouton Premium
  async function handlePremiumClick() {
    if (!user) {
      // Rediriger vers l'inscription si pas connecté
      setLocation("/inscription");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la création du paiement");
      }

      const { url } = await res.json();
      
      // Rediriger vers Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  // Gérer le clic sur le bouton Agency Elite
  function handleEliteClick() {
    // Ouvrir Calendly ou une page de contact
    window.open("https://calendly.com/onlytrack/demo", "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text">
              Tarifs
            </h1>
            <p className="text-muted-foreground">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Premium Plan */}
          <Card className="glass-card border-primary/30 rounded-3xl relative overflow-hidden">
            {/* Badge populaire */}
            <div className="absolute top-4 right-4">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                Populaire
              </span>
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Pour les agences en croissance
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Prix */}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold gradient-text">49€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>

              {/* Trial */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                <span className="text-green-400 font-medium">
                  ✨ 3 jours d'essai gratuit
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Accès complet à toutes les fonctionnalités</span>
                </li>
                <li className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Analytics connectés (TikTok, Instagram)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Assistant IA illimité</span>
                </li>
                <li className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-primary" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Modèles et équipe illimités</span>
                </li>
              </ul>

              {/* CTA */}
              <Button
                onClick={handlePremiumClick}
                disabled={loading}
                className="w-full rounded-xl neon-glow py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Commencer l'essai gratuit"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Annulez à tout moment. Pas de frais cachés.
              </p>
            </CardContent>
          </Card>

          {/* Agency Elite Plan */}
          <Card className="glass-card border-primary/10 rounded-3xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Agency Elite</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Pour les grandes agences
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Prix */}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-primary">Personnalisé</span>
              </div>

              {/* Description */}
              <div className="bg-primary/20 border border-primary/10 rounded-xl p-3 text-center">
                <span className="text-primary font-medium">
                  📞 Prix sur mesure
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Tout le plan Premium inclus</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Fonctionnalités sur-mesure</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Intégrations spécifiques</span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Support dédié</span>
                </li>
                <li className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Call stratégique offert</span>
                </li>
              </ul>

              {/* CTA */}
              <Button
                onClick={handleEliteClick}
                variant="outline"
                className="w-full rounded-xl py-6 text-lg border-primary/30 hover:bg-primary/10"
              >
                Réserver un appel
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Discutons de vos besoins spécifiques.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ ou autres infos */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>
            Des questions ?{" "}
            <a href="mailto:contact@onlytrack.io" className="text-primary hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
