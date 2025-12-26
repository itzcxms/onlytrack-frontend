import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/stat-card";
import {
  Users,
  Heart,
  Eye,
  TrendingUp,
  Sparkles,
  BarChart3,
  List,
  RefreshCw,
} from "lucide-react";
import { SiInstagram, SiTiktok, SiThreads } from "react-icons/si";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { OAuthConnectModal } from "@/components/oauth-connect-modal";
import { TikTokVideoCard } from "@/components/tiktok-video-card";
import { PostPerformanceItem } from "@/components/post-performance-item";
import { PostDetailModal } from "@/components/post-detail-modal";
import type { Modele, PostAnalytics } from "@shared/schema";

export default function Analytics() {
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [username, setUsername] = useState("");
  const [viewMode, setViewMode] = useState<"stats" | "graph">("stats");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<
    "instagram" | "tiktok" | "threads" | ""
  >("");
  const [analysisType, setAnalysisType] = useState("");
  const [timeframe, setTimeframe] = useState("120");
  const [selectedPost, setSelectedPost] = useState<PostAnalytics | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  // Fetch models
  const { data: models = [] } = useQuery<Modele[]>({
    queryKey: ["/api/models"],
  });

  // Fetch analytics posts for selected model
  const { data: posts = [] } = useQuery<PostAnalytics[]>({
    queryKey: ["/api/analytics-posts", selectedModelId],
    enabled: !!selectedModelId,
    queryFn: async () => {
      if (!selectedModelId) return [];
      const response = await fetch(
        `/api/analytics-posts?modelId=${encodeURIComponent(selectedModelId)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics posts");
      }
      const data = await response.json();
      console.log("Fetched analytics posts:", data);
      return data;
    },
  });

  const selectedModel = models.find((m) => m.id === selectedModelId);

  // Check OAuth status for each platform
  const { data: instagramStatus } = useQuery<{
    connected: boolean;
    valid: boolean;
  }>({
    queryKey: ["/api/models", selectedModelId, "oauth-status", "instagram"],
    enabled: !!selectedModelId,
    queryFn: async () => {
      if (!selectedModelId) return { connected: false, valid: false };
      const response = await fetch(
        `/api/models/${selectedModelId}/oauth-status?platform=instagram`,
      );
      return response.json();
    },
  });

  const { data: tiktokStatus } = useQuery<{
    connected: boolean;
    valid: boolean;
  }>({
    queryKey: ["/api/models", selectedModelId, "oauth-status", "tiktok"],
    enabled: !!selectedModelId,
    queryFn: async () => {
      if (!selectedModelId) return { connected: false, valid: false };
      const response = await fetch(
        `/api/models/${selectedModelId}/oauth-status?platform=tiktok`,
      );
      return response.json();
    },
  });

  const { data: threadsStatus } = useQuery<{
    connected: boolean;
    valid: boolean;
  }>({
    queryKey: ["/api/models", selectedModelId, "oauth-status", "threads"],
    enabled: !!selectedModelId,
    queryFn: async () => {
      if (!selectedModelId) return { connected: false, valid: false };
      const response = await fetch(
        `/api/models/${selectedModelId}/oauth-status?platform=threads`,
      );
      return response.json();
    },
  });

  const queryClient = useQueryClient();

  // Helper function to check if a model has a valid connected account for a platform
  const hasConnectedAccount = (
    platform: "instagram" | "tiktok" | "threads",
  ): boolean => {
    switch (platform) {
      case "instagram":
        return (instagramStatus?.connected && instagramStatus?.valid) || false;
      case "tiktok":
        return (tiktokStatus?.connected && tiktokStatus?.valid) || false;
      case "threads":
        return (threadsStatus?.connected && threadsStatus?.valid) || false;
      default:
        return false;
    }
  };

  // Mutation to sync insights
  const syncInsightsMutation = useMutation({
    mutationFn: async (platform?: "tiktok" | "instagram" | "all") => {
      if (!selectedModelId) throw new Error("No model selected");
      const response = await fetch(
        `/api/models/${selectedModelId}/sync-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ platform: platform || "all" }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to sync insights");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch analytics posts
      queryClient.invalidateQueries({
        queryKey: ["/api/analytics-posts", selectedModelId],
      });
    },
  });

  // Auto-sync insights when a model with connected accounts is selected
  useEffect(() => {
    if (
      selectedModelId &&
      (hasConnectedAccount("tiktok") || hasConnectedAccount("instagram")) &&
      instagramStatus !== undefined &&
      tiktokStatus !== undefined
    ) {
      // Small delay to ensure OAuth status queries are complete
      const timer = setTimeout(() => {
        syncInsightsMutation.mutate("all");
      }, 1000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModelId, instagramStatus?.connected, tiktokStatus?.connected]);

  // Filter posts by timeframe
  const filteredPosts = posts.filter((post) => {
    if (!timeframe) return true;
    const daysAgo = parseInt(timeframe);
    const postDate = new Date(post.datePublication);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    return postDate >= cutoffDate;
  });

  // Prepare chart data
  const chartData = filteredPosts.map((post, index) => ({
    name: `Post ${index + 1}`,
    engagement: post.engagement,
    views: post.vues,
    likes: post.likes,
    comments: post.commentaires,
  }));

  const handleConnectPlatform = (
    platform: "instagram" | "tiktok" | "threads",
  ) => {
    setConnectPlatform(platform);
    setConnectModalOpen(true);
  };

  const simulateOAuth = () => {
    // Simulate OAuth connection
    setTimeout(() => {
      setConnectModalOpen(false);
      setConnectPlatform("");
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances de vos modèles
          </p>
        </div>
        {/* Boutons de connexion - affichés uniquement si un modèle est sélectionné et n'a pas de compte connecté */}
        {selectedModel && (
          <div className="flex gap-3">
            {!hasConnectedAccount("instagram") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnectPlatform("instagram")}
                data-testid="button-connect-instagram"
                className="rounded-xl border-primary/30 hover:bg-primary/10"
              >
                <SiInstagram className="w-4 h-4 mr-2" />
                Connecter Instagram
              </Button>
            )}
            {!hasConnectedAccount("threads") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnectPlatform("threads")}
                data-testid="button-connect-threads"
                className="rounded-xl border-primary/30 hover:bg-primary/10"
              >
                <SiThreads className="w-4 h-4 mr-2" />
                Connecter Threads
              </Button>
            )}
            {!hasConnectedAccount("tiktok") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnectPlatform("tiktok")}
                data-testid="button-connect-tiktok"
                className="rounded-xl border-primary/30 hover:bg-primary/10"
              >
                <SiTiktok className="w-4 h-4 mr-2" />
                Connecter TikTok
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Model Selector */}
      <Card className="glass-card rounded-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Sélectionner un modèle</Label>
              <Select
                value={selectedModelId}
                onValueChange={setSelectedModelId}
              >
                <SelectTrigger
                  data-testid="select-model"
                  className="rounded-xl bg-black/40 border-primary/20"
                >
                  <SelectValue placeholder="Choisir un modèle..." />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.nom} (@{model.nomUtilisateur || model.plateforme})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ou entrer @username manuellement</Label>
              <Input
                placeholder="@username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl bg-black/40 border-primary/20"
                data-testid="input-username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedModel && (
        <>
          {/* KPIs Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Followers"
              value={selectedModel.abonnes?.toLocaleString() || "0"}
              icon={<Users className="w-5 h-5" />}
              iconColor="bg-primary/20 text-primary"
              trend={5.2}
            />
            <StatCard
              title="Engagement Rate"
              value={`${selectedModel.engagement?.toFixed(1) || 0}%`}
              icon={<Heart className="w-5 h-5" />}
              iconColor="bg-primary/20 text-primary"
              trend={12.8}
            />
            <StatCard
              title="Average Reach"
              value={selectedModel.porteeMoyenne?.toLocaleString() || "0"}
              icon={<Eye className="w-5 h-5" />}
              iconColor="bg-primary/20 text-primary"
              trend={8.3}
            />
          </div>

          {/* Performance Section */}
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="font-display gradient-text">
                    Performance des posts
                  </CardTitle>
                  {syncInsightsMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synchronisation...</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "stats" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setViewMode("stats")}
                    data-testid="button-view-stats"
                    className="rounded-xl"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Statistics
                  </Button>
                  <Button
                    variant={viewMode === "graph" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setViewMode("graph")}
                    data-testid="button-view-graph"
                    className="rounded-xl"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Graph
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "stats" ? (
                filteredPosts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun post disponible pour ce modèle
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredPosts.map((post, index) => (
                      <PostPerformanceItem
                        key={post.id}
                        post={post}
                        index={index}
                        onClick={() => {
                          setSelectedPost(post);
                          setPostModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(270 89% 66%)"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(270 89% 66%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="hsl(270 30% 20%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(270 15% 60%)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(270 15% 60%)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(13, 10, 20, 0.9)",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        borderRadius: "1rem",
                        fontSize: "12px",
                        boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(270 89% 66%)"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                      dot={{
                        fill: "hsl(270 89% 66%)",
                        r: 4,
                        strokeWidth: 2,
                        stroke: "hsl(270 89% 66%)",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "hsl(270 89% 66%)",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Button */}
          <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="w-full rounded-2xl neon-glow"
                data-testid="button-analyze-ai"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Analyser avec IA
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display gradient-text">
                  Analyse IA
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Type d'analyse</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger
                      data-testid="select-analysis-type"
                      className="rounded-xl bg-black/40 border-primary/20"
                    >
                      <SelectValue placeholder="Choisir le type d'analyse..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-views">
                        Posts avec le plus de vues
                      </SelectItem>
                      <SelectItem value="most-likes">
                        Posts avec le plus de likes
                      </SelectItem>
                      <SelectItem value="best-engagement">
                        Posts avec meilleur engagement
                      </SelectItem>
                      <SelectItem value="most-comments">
                        Posts avec le plus de commentaires
                      </SelectItem>
                      <SelectItem value="global-top">
                        Top post global (toutes métriques)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Période</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger
                      data-testid="select-timeframe"
                      className="rounded-xl bg-black/40 border-primary/20"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 derniers jours</SelectItem>
                      <SelectItem value="15">15 derniers jours</SelectItem>
                      <SelectItem value="30">30 derniers jours</SelectItem>
                      <SelectItem value="90">90 derniers jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full rounded-xl neon-glow"
                  onClick={() => {
                    // TODO: Implement AI analysis
                    setAiModalOpen(false);
                  }}
                  data-testid="button-run-analysis"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Lancer l'analyse
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {!selectedModel && (
        <Card className="glass-card rounded-3xl">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display gradient-text">
                Sélectionnez un modèle
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choisissez un modèle dans la liste ci-dessus pour voir ses
                analytics et performances
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
      />

      {/* OAuth Connect Modal (uses popup for external auth) */}
      <OAuthConnectModal
        open={connectModalOpen}
        onOpenChange={(open) => {
          // reset platform when modal closes
          if (!open) setConnectPlatform("");
          setConnectModalOpen(open);
        }}
        platform={connectPlatform as "tiktok" | "instagram" | "threads" | ""}
        modelId={selectedModelId}
      />
    </div>
  );
}
