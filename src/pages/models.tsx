import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Instagram,
  Link as LinkIcon,
  Calendar,
  Mail,
  ExternalLink,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Modele } from "@shared/schema";

export default function ModelsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    platform: "OnlyFans",
    instagramUrl: "",
    tiktokUrl: "",
    otherSocialUrls: "",
    notes: "",
    onboardingDate: "",
  });

  const { data: models = [], isLoading } = useQuery<Modele[]>({
    queryKey: ["/api/models"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/models", "POST", {
        nom: data.name,
        pseudo: data.username,
        email: data.email || null,
        plateforme: data.platform,
        urlInstagram: data.instagramUrl || null,
        urlTiktok: data.tiktokUrl || null,
        autresReseaux: data.otherSocialUrls || null,
        notes: data.notes || null,
        dateOnboarding: data.onboardingDate
          ? new Date(data.onboardingDate).toISOString()
          : null,
        abonnes: 0,
        engagement: 0,
        porteeMoyenne: 0,
        revenus: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Modèle ajouté",
        description: "Le modèle a été créé avec succès.",
      });
      setModalOpen(false);
      setFormData({
        name: "",
        username: "",
        email: "",
        platform: "OnlyFans",
        instagramUrl: "",
        tiktokUrl: "",
        otherSocialUrls: "",
        notes: "",
        onboardingDate: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le modèle",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username) {
      toast({
        title: "Erreur",
        description: "Nom et username requis",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Models
          </h1>
          <p className="text-muted-foreground">
            Gérez vos modèles et leur onboarding
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="button-add-model"
              className="rounded-xl neon-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a Model
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display gradient-text">
                Ajouter un modèle
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    placeholder="Emma Johnson"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username / Instagram *</Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    placeholder="@emmaj"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="glass-card border-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="emma@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboardingDate">Date d'onboarding</Label>
                  <Input
                    id="onboardingDate"
                    data-testid="input-onboarding-date"
                    type="date"
                    value={formData.onboardingDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        onboardingDate: e.target.value,
                      })
                    }
                    className="glass-card border-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Lien Instagram</Label>
                <Input
                  id="instagramUrl"
                  data-testid="input-instagram"
                  placeholder="https://instagram.com/emmaj"
                  value={formData.instagramUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramUrl: e.target.value })
                  }
                  className="glass-card border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktokUrl">Lien TikTok</Label>
                <Input
                  id="tiktokUrl"
                  data-testid="input-tiktok"
                  placeholder="https://tiktok.com/@emmaj"
                  value={formData.tiktokUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktokUrl: e.target.value })
                  }
                  className="glass-card border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherSocialUrls">Autres réseaux sociaux</Label>
                <Input
                  id="otherSocialUrls"
                  data-testid="input-other-socials"
                  placeholder="YouTube, Twitter, etc."
                  value={formData.otherSocialUrls}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otherSocialUrls: e.target.value,
                    })
                  }
                  className="glass-card border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Commentaires</Label>
                <Textarea
                  id="notes"
                  data-testid="input-notes"
                  placeholder="Informations supplémentaires..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="glass-card border-primary/20 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl"
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl neon-glow"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-model"
                >
                  {createMutation.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="glass-card neon-border rounded-3xl animate-pulse"
            >
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-primary/20 rounded mb-2"></div>
                <div className="h-3 bg-primary/20 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : models.length === 0 ? (
        <Card className="glass-card border-primary/20 rounded-3xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucun modèle pour le moment
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            className="rounded-xl neon-glow"
            data-testid="button-add-first-model"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre premier modèle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card
              key={model.id}
              className="glass-card neon-border rounded-3xl hover-elevate active-elevate-2 transition-all"
              data-testid={`card-model-${model.id}`}
            >
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={model.urlPhoto || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-display text-lg">
                    {getInitials(model.nom)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl gradient-text truncate">
                    {model.nom}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">
                    {model.nomUtilisateur}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {model.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground truncate">
                      {model.email}
                    </span>
                  </div>
                )}
                {model.dateOnboarding && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {new Date(model.dateOnboarding).toLocaleDateString(
                        "fr-FR",
                      )}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="rounded-2xl">
                    {model.plateforme}
                  </Badge>
                  {model.urlInstagram && (
                    <Badge variant="outline" className="rounded-2xl gap-1">
                      <Instagram className="w-3 h-3" />
                      Instagram
                    </Badge>
                  )}
                  {model.urlTiktok && (
                    <Badge variant="outline" className="rounded-2xl gap-1">
                      <SiTiktok className="w-3 h-3" />
                      TikTok
                    </Badge>
                  )}
                </div>
                {model.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {model.notes}
                  </p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  onClick={() => navigate(`/onboarding?modelId=${model.id}`)}
                  className="flex-1 rounded-xl neon-glow"
                  data-testid={`button-onboarding-${model.id}`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Voir Onboarding
                </Button>
                {(model.urlInstagram || model.urlTiktok) && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const url = model.urlInstagram || model.urlTiktok;
                      if (url) window.open(url, "_blank");
                    }}
                    className="rounded-xl"
                    data-testid={`button-social-${model.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
