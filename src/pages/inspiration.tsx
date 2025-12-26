import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Inspiration, Modele } from "@shared/schema";

export default function InspirationPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [formData, setFormData] = useState({
    modelId: "",
    platform: "",
    url: "",
    notes: "",
    views: "",
    likes: "",
    comments: "",
  });

  const { data: models = [] } = useQuery<Modele[]>({
    queryKey: ["/api/models"],
  });

  const { data: inspirations = [] } = useQuery<Inspiration[]>({
    queryKey: ["/api/inspirations"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const views = parseInt(data.views) || 0;
      const likes = parseInt(data.likes) || 0;
      const comments = parseInt(data.comments) || 0;

      return apiRequest("/api/inspirations", "POST", {
        modeleId: data.modelId || null,
        plateforme: data.platform,
        url: data.url,
        notes: data.notes,
        vues: views,
        likes,
        commentaires: comments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspirations"] });
      toast({
        title: "Inspiration ajoutée",
        description: "Le contenu a été ajouté à la bibliothèque.",
      });
      setModalOpen(false);
      setFormData({
        modelId: "",
        platform: "",
        url: "",
        notes: "",
        views: "",
        likes: "",
        comments: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'inspiration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.platform || !formData.url) {
      toast({
        title: "Erreur",
        description: "Plateforme et URL requis",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredInspirations = inspirations.filter((insp) => {
    const matchModel =
      filterModel === "all" || insp.modeleId?.toString() === filterModel;
    const matchPlatform =
      filterPlatform === "all" || insp.plateforme === filterPlatform;
    return matchModel && matchPlatform;
  });

  const platforms = Array.from(new Set(inspirations.map((i) => i.plateforme)));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Inspiration
          </h1>
          <p className="text-muted-foreground">
            Bibliothèque de contenu inspirant
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="button-add-inspiration"
              className="rounded-xl neon-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/20 max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display gradient-text">
                Ajouter du contenu
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modèle (optionnel)</Label>
                  <Select
                    value={formData.modelId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, modelId: value })
                    }
                  >
                    <SelectTrigger
                      className="rounded-xl bg-black/40 border-primary/20"
                      data-testid="select-model"
                    >
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plateforme</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger
                      className="rounded-xl bg-black/40 border-primary/20"
                      data-testid="select-platform"
                    >
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="OnlyFans">OnlyFans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="rounded-xl bg-black/40 border-primary/20"
                  data-testid="input-url"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Pourquoi ce contenu est inspirant..."
                  rows={3}
                  className="rounded-xl bg-black/40 border-primary/20"
                  data-testid="textarea-notes"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Views</Label>
                  <Input
                    type="number"
                    value={formData.views}
                    onChange={(e) =>
                      setFormData({ ...formData, views: e.target.value })
                    }
                    placeholder="0"
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-views"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Likes</Label>
                  <Input
                    type="number"
                    value={formData.likes}
                    onChange={(e) =>
                      setFormData({ ...formData, likes: e.target.value })
                    }
                    placeholder="0"
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-likes"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Input
                    type="number"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    placeholder="0"
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-comments"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl neon-glow"
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label>Modèle:</Label>
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger
              className="rounded-xl bg-black/40 border-primary/20 w-48"
              data-testid="filter-model"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Plateforme:</Label>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger
              className="rounded-xl bg-black/40 border-primary/20 w-48"
              data-testid="filter-platform"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInspirations.length > 0 ? (
          filteredInspirations.map((item) => (
            <Card
              key={item.id}
              className="glass-card rounded-3xl overflow-hidden"
              data-testid={`card-inspiration-${item.id}`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="rounded-xl mb-2">
                      {item.plateforme}
                    </Badge>
                    {item.modeleId && (
                      <p className="text-sm text-muted-foreground truncate">
                        {models.find((m) => m.id === item.modeleId)?.nom ||
                          "Unknown"}
                      </p>
                    )}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover-elevate p-2 rounded-xl"
                    data-testid={`link-external-${item.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {item.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.notes}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-primary/10">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{item.vues?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3" />
                    <span>{item.likes?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="w-3 h-3" />
                    <span>{item.commentaires?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Aucun contenu trouvé. Cliquez sur "Add Content" pour commencer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
