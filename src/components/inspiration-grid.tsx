import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function InspirationGrid() {
  const { toast } = useToast();

  const { data: inspirations = [] } = useQuery<any[]>({
    queryKey: ["/api/inspirations"],
  });

  const analyzeAIMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/analyze-content", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspirations"] });
      toast({
        title: "Analyse IA terminée",
        description: "Les contenus ont été analysés par l'IA.",
      });
    },
  });

  const handleAddInspiration = () => {
    toast({
      title: "Ajouter une inspiration",
      description: "Fonctionnalité d'ajout à venir.",
    });
  };

  const handleAnalyzeAI = () => {
    analyzeAIMutation.mutate();
  };

  return (
    <div className="space-y-4" data-testid="inspiration-grid">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Inspirations</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAnalyzeAI}
            data-testid="button-analyze-inspirations"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyser IA
          </Button>
          <Button
            onClick={handleAddInspiration}
            data-testid="button-add-inspiration"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspirations.map((inspiration: any) => (
          <Card
            key={inspiration.id}
            className="backdrop-blur-md bg-black/20 border-violet-500/20 hover-elevate group"
            data-testid={`card-inspiration-${inspiration.id}`}
          >
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-medium line-clamp-2">
                  {inspiration.title}
                </h3>
                <a
                  href={inspiration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  {inspiration.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap gap-1">
                {inspiration.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-violet-500/10">
                <Badge variant="secondary">{inspiration.model}</Badge>
                {inspiration.performance && (
                  <div className="text-sm font-display text-primary">
                    {inspiration.performance}% score
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
