import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOAuthPopup } from "@/hooks/useOAuthPopup";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import axios from "axios";

interface OAuthConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: "tiktok" | "instagram" | "threads" | "";
  modelId?: string;
}

export function OAuthConnectModal({
  open,
  onOpenChange,
  platform,
  modelId,
}: OAuthConnectModalProps) {
  const { openPopup, error } = useOAuthPopup();
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch OAuth configuration from backend
  useEffect(() => {
    if (open && platform) {
      const fetchOAuthConfig = async () => {
        try {
          // Try to get config from current origin first
          const currentOrigin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
          const viteApiUrl = (import.meta as any).env?.VITE_API_URL as
            | string
            | undefined;
          const apiBase = viteApiUrl || currentOrigin;

          const response = await axios.get(`${apiBase}/api/oauth/config`);
          setBackendUrl(response.data.backendUrl);
          console.log(
            "OAuth - Backend URL from API:",
            response.data.backendUrl,
          );
        } catch (err) {
          console.error("Failed to fetch OAuth config, using fallback:", err);
          // Fallback to current origin
          const currentOrigin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
          setBackendUrl(currentOrigin);
        }
      };
      fetchOAuthConfig();
    }
  }, [open, platform]);

  const openOAuthPopup = async (platform: string): Promise<boolean> => {
    if (!backendUrl) {
      toast({
        title: "Erreur",
        description: "Configuration OAuth non disponible. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    }

    // URLs OAuth pour chaque plateforme (inclure modelId si fourni)
    const baseUrls: Record<string, string> = {
      instagram: `${backendUrl}/auth/instagram`,
      tiktok: `${backendUrl}/auth/tiktok`,
      threads: `${backendUrl}/auth/threads`,
    };

    const platformKey = platform.toLowerCase();
    const baseUrl = baseUrls[platformKey];

    // Ajouter modelId comme query param si fourni
    const oauthUrl = modelId
      ? `${baseUrl}?modelId=${encodeURIComponent(modelId)}`
      : baseUrl;

    if (!oauthUrl) {
      toast({
        title: "Plateforme non supportée",
        description: `La plateforme ${platform} n'est pas encore supportée pour l'authentification OAuth.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      // Ouvrir la popup OAuth avec le hook React
      openPopup(oauthUrl);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la popup OAuth:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir la popup d'authentification.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    await openOAuthPopup(platform);
    setLoading(false);
  };

  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {platform === "tiktok"
              ? "Connecter TikTok"
              : platform === "instagram"
                ? "Connecter Instagram"
                : "Connecter"}
          </DialogTitle>
          <DialogDescription>
            {platform === "tiktok"
              ? "Autorisez l'application à accéder à votre compte TikTok pour synchroniser les statistiques et le contenu."
              : platform === "instagram"
                ? "Autorisez l'application à accéder à votre compte Instagram pour synchroniser les statistiques et le contenu."
                : "Cette intégration n'est pas disponible."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Button clicked for platform:", platform);
                handleConnect();
              }}
              className="w-full max-w-sm"
              disabled={loading || !backendUrl}
            >
              {loading
                ? "Chargement..."
                : `Autoriser l'accès à ${platform === "tiktok" ? "TikTok" : "Instagram"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
