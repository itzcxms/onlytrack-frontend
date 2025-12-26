import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Twitter } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Modele } from "@shared/schema";

interface Platform {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  followers?: string;
  engagement?: string;
}

export function AnalyticsCard() {
  const { toast } = useToast();

  const { data: models = [] } = useQuery<Modele[]>({
    queryKey: ["/api/models"],
  });

  const getPlatformStats = (platform: string) => {
    const platformModels = models.filter(
      (m) => m.plateforme === platform.toLowerCase(),
    );
    const totalFollowers = platformModels.reduce(
      (sum, m) => sum + (m.abonnes || 0),
      0,
    );
    const avgEngagement =
      platformModels.length > 0
        ? platformModels.reduce((sum, m) => sum + (m.engagement || 0), 0) /
          platformModels.length
        : 0;

    return {
      followers:
        totalFollowers >= 1000000
          ? `${(totalFollowers / 1000000).toFixed(1)}M`
          : totalFollowers >= 1000
            ? `${(totalFollowers / 1000).toFixed(1)}k`
            : totalFollowers.toString(),
      engagement: `${avgEngagement.toFixed(1)}%`,
    };
  };

  const instagramStats = getPlatformStats("instagram");
  const tiktokStats = getPlatformStats("tiktok");

  const platforms: Platform[] = [
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      connected: true,
      followers: instagramStats.followers,
      engagement: instagramStats.engagement,
    },
    {
      name: "TikTok",
      icon: <Youtube className="w-5 h-5" />,
      connected: true,
      followers: tiktokStats.followers,
      engagement: tiktokStats.engagement,
    },
    {
      name: "Threads",
      icon: <Twitter className="w-5 h-5" />,
      connected: false,
    },
  ];

  const analyzeAIMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/analyze-content", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Analyse IA terminée",
        description:
          "Les contenus ont été analysés et classés par performance.",
      });
    },
  });

  const handleConnect = (platformName: string) => {
    toast({
      title: `Connexion ${platformName}`,
      description:
        "La connexion aux plateformes sera disponible prochainement.",
    });
  };

  const handleAnalyzeAI = () => {
    analyzeAIMutation.mutate();
  };

  return (
    <Card
      className="backdrop-blur-md bg-black/20 border-violet-500/20"
      data-testid="card-analytics"
    >
      <CardHeader>
        <CardTitle className="font-display">Plateformes connectées</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-violet-500/10"
            data-testid={`platform-${platform.name.toLowerCase()}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-primary">{platform.icon}</div>
              <div>
                <div className="font-medium">{platform.name}</div>
                {platform.connected && platform.followers && (
                  <div className="text-xs text-muted-foreground">
                    {platform.followers} followers • {platform.engagement}{" "}
                    engagement
                  </div>
                )}
              </div>
            </div>
            {platform.connected ? (
              <Badge variant="outline" className="border-chart-2 text-chart-2">
                Connecté
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect(platform.name)}
                data-testid={`button-connect-${platform.name.toLowerCase()}`}
              >
                Connecter
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="default"
          className="w-full"
          onClick={handleAnalyzeAI}
          data-testid="button-analyze-ai"
        >
          Analyser avec l'IA
        </Button>
      </CardContent>
    </Card>
  );
}
