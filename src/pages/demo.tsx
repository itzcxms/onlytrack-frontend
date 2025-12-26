// ==========================================
// PAGE D'ACCÈS DEMO
// Accès temporaire via lien partagé
// ==========================================

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DemoInfo {
  nom: string;
  agenceNom: string;
  dateExpiration: string | null;
}

export default function DemoAccessPage() {
  const [, params] = useRoute("/demo/:token");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired">("loading");
  const [demoInfo, setDemoInfo] = useState<DemoInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function validateToken() {
      if (!params?.token) {
        setStatus("invalid");
        setError("Lien invalide");
        return;
      }

      try {
        const res = await fetch(`/api/demo/validate/${params.token}`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setDemoInfo(data);
          setStatus("valid");
        } else {
          const data = await res.json();
          if (data.error?.includes("expiré")) {
            setStatus("expired");
          } else {
            setStatus("invalid");
          }
          setError(data.error || "Lien invalide");
        }
      } catch (err) {
        setStatus("invalid");
        setError("Erreur de connexion");
      }
    }

    validateToken();
  }, [params?.token]);

  const handleEnterDemo = async () => {
    try {
      const res = await fetch(`/api/demo/access/${params?.token}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        // Rediriger vers le dashboard
        setLocation("/");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur d'accès");
      }
    } catch (err) {
      setError("Erreur de connexion");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="glass-card border-primary/30 rounded-3xl w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            status === "loading" ? "bg-primary/20" :
            status === "valid" ? "bg-green-500/20" :
            "bg-red-500/20"
          }`}>
            {status === "loading" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {status === "valid" && <CheckCircle className="w-8 h-8 text-green-500" />}
            {(status === "invalid" || status === "expired") && <AlertCircle className="w-8 h-8 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Vérification..."}
            {status === "valid" && "Accès Demo"}
            {status === "invalid" && "Lien Invalide"}
            {status === "expired" && "Lien Expiré"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <p className="text-muted-foreground">
              Validation de votre accès en cours...
            </p>
          )}

          {status === "valid" && demoInfo && (
            <>
              <div className="space-y-2 text-left bg-primary/5 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Bienvenue,</p>
                <p className="font-semibold text-lg">{demoInfo.nom}</p>
                <p className="text-sm text-muted-foreground">
                  Accès à : <span className="text-foreground">{demoInfo.agenceNom}</span>
                </p>
                {demoInfo.dateExpiration && (
                  <p className="text-xs text-muted-foreground">
                    Expire le : {new Date(demoInfo.dateExpiration).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
              <Button
                onClick={handleEnterDemo}
                className="w-full rounded-xl neon-glow"
              >
                Accéder à la démo
              </Button>
            </>
          )}

          {(status === "invalid" || status === "expired") && (
            <>
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
                Ce lien n'est plus valide ou a été révoqué.
                Contactez-nous pour obtenir un nouveau lien.
              </p>
              <Button
                variant="outline"
                onClick={() => setLocation("/login")}
                className="rounded-xl"
              >
                Aller à la connexion
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
