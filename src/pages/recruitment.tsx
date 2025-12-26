import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { MessageSquare, Plus, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CandidatDm, ScriptDm } from "@shared/schema";

export default function Recruitment() {
  const { toast } = useToast();
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    platform: "",
    followers: "",
    scriptId: "",
  });
  const [scriptForm, setScriptForm] = useState({
    name: "",
    content: "",
  });

  const { data: scripts = [] } = useQuery<ScriptDm[]>({
    queryKey: ["/api/dm-scripts"],
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (data: typeof candidateForm) => {
      const script = scripts.find((s) => s.id === data.scriptId);
      return apiRequest("/api/dm-candidates", "POST", {
        nom: data.name,
        plateforme: data.platform,
        abonnes: data.followers,
        statut: "sent",
        script: script?.nom || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dm-candidates"] });
      toast({
        title: "Candidat ajouté",
        description: "Le candidat a été ajouté au pipeline.",
      });
      setCandidateModalOpen(false);
      setCandidateForm({ name: "", platform: "", followers: "", scriptId: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le candidat",
        variant: "destructive",
      });
    },
  });

  const createScriptMutation = useMutation({
    mutationFn: async (data: typeof scriptForm) => {
      return apiRequest("/api/dm-scripts", "POST", {
        nom: data.name,
        contenu: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dm-scripts"] });
      toast({
        title: "Script créé",
        description: "Le script DM a été créé avec succès.",
      });
      setScriptModalOpen(false);
      setScriptForm({ name: "", content: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le script",
        variant: "destructive",
      });
    },
  });

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.platform) {
      toast({
        title: "Erreur",
        description: "Nom et plateforme requis",
        variant: "destructive",
      });
      return;
    }
    createCandidateMutation.mutate(candidateForm);
  };

  const handleCreateScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptForm.name || !scriptForm.content) {
      toast({
        title: "Erreur",
        description: "Nom et contenu requis",
        variant: "destructive",
      });
      return;
    }
    createScriptMutation.mutate(scriptForm);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Recrutement / DMs
          </h1>
          <p className="text-muted-foreground">
            Pipeline de recrutement et scripts de conversion
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog
            open={candidateModalOpen}
            onOpenChange={setCandidateModalOpen}
          >
            <DialogTrigger asChild>
              <Button
                data-testid="button-add-candidate"
                className="rounded-xl neon-glow"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display gradient-text">
                  Ajouter un candidat
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCandidate} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={candidateForm.name}
                    onChange={(e) =>
                      setCandidateForm({
                        ...candidateForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Nom du candidat"
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-candidate-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plateforme</Label>
                  <Select
                    value={candidateForm.platform}
                    onValueChange={(value) =>
                      setCandidateForm({ ...candidateForm, platform: value })
                    }
                  >
                    <SelectTrigger
                      className="rounded-xl bg-black/40 border-primary/20"
                      data-testid="select-platform"
                    >
                      <SelectValue placeholder="Sélectionner une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="OnlyFans">OnlyFans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Followers</Label>
                  <Input
                    value={candidateForm.followers}
                    onChange={(e) =>
                      setCandidateForm({
                        ...candidateForm,
                        followers: e.target.value,
                      })
                    }
                    placeholder="10K, 50K, etc."
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-followers"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Script DM</Label>
                  <Select
                    value={candidateForm.scriptId}
                    onValueChange={(value) =>
                      setCandidateForm({ ...candidateForm, scriptId: value })
                    }
                  >
                    <SelectTrigger
                      className="rounded-xl bg-black/40 border-primary/20"
                      data-testid="select-script"
                    >
                      <SelectValue placeholder="Sélectionner un script" />
                    </SelectTrigger>
                    <SelectContent>
                      {scripts.map((script) => (
                        <SelectItem key={script.id} value={script.id}>
                          {script.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl neon-glow"
                  disabled={createCandidateMutation.isPending}
                  data-testid="button-submit-candidate"
                >
                  Ajouter
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={scriptModalOpen} onOpenChange={setScriptModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                data-testid="button-add-script"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Script
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display gradient-text">
                  Nouveau script DM
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateScript} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom du script</Label>
                  <Input
                    value={scriptForm.name}
                    onChange={(e) =>
                      setScriptForm({ ...scriptForm, name: e.target.value })
                    }
                    placeholder="Script principal"
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="input-script-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenu</Label>
                  <Textarea
                    value={scriptForm.content}
                    onChange={(e) =>
                      setScriptForm({ ...scriptForm, content: e.target.value })
                    }
                    placeholder="Hey! I'm reaching out because..."
                    rows={6}
                    className="rounded-xl bg-black/40 border-primary/20"
                    data-testid="textarea-script-content"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl neon-glow"
                  disabled={createScriptMutation.isPending}
                  data-testid="button-submit-script"
                >
                  Créer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <KanbanBoard />

      <Card className="glass-card rounded-3xl">
        <CardHeader>
          <CardTitle className="font-display gradient-text flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Scripts DM performants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scripts.length > 0 ? (
              scripts.map((script) => (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-4 rounded-2xl glass-card"
                  data-testid={`script-${script.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium font-display">{script.nom}</div>
                    <div className="text-sm text-muted-foreground mt-1 truncate">
                      {script.contenu}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Utilisé {script.nombreUtilisations || 0} fois
                    </div>
                  </div>
                  <Badge
                    variant={
                      script.tauxConversion && script.tauxConversion > 30
                        ? "default"
                        : "secondary"
                    }
                    className="rounded-xl"
                  >
                    {script.tauxConversion || 0}% conversion
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun script créé. Cliquez sur "New Script" pour commencer.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
