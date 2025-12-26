import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Trash2, Edit2, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Modele, EtapeOnboarding } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const initialModeleId = params.get("modelId") || "";

  const [selectedModeleId, setSelectedModeleId] = useState(initialModeleId);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    stepName: "",
    description: "",
    dueDate: "",
    order: 0,
  });

  const { data: models = [] } = useQuery<Modele[]>({
    queryKey: ["/api/models"],
  });

  const { data: steps = [] } = useQuery<EtapeOnboarding[]>({
    queryKey: ["/api/onboarding-steps", selectedModeleId],
    queryFn: async () => {
      const res = await fetch(
        `/api/onboarding-steps?modelId=${selectedModeleId}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to fetch onboarding steps");
      return res.json();
    },
    enabled: !!selectedModeleId,
  });

  useEffect(() => {
    if (models.length > 0 && !selectedModeleId) {
      setSelectedModeleId(models[0].id);
    }
  }, [models]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/onboarding-steps", "POST", {
        modeleId: selectedModeleId,
        nomEtape: data.stepName,
        description: data.description || null,
        dateEcheance: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : null,
        ordre: steps.length,
        terminee: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/onboarding-steps", selectedModeleId],
      });
      toast({
        title: "Étape ajoutée",
        description: "L'étape a été ajoutée au processus d'onboarding.",
      });
      setModalOpen(false);
      setFormData({ stepName: "", description: "", dueDate: "", order: 0 });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'étape",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EtapeOnboarding>;
    }) => {
      return apiRequest(`/api/onboarding-steps/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/onboarding-steps", selectedModeleId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'étape",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/onboarding-steps/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/onboarding-steps", selectedModeleId],
      });
      toast({
        title: "Étape supprimée",
        description: "L'étape a été retirée du processus d'onboarding.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'étape",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stepName) {
      toast({
        title: "Erreur",
        description: "Le nom de l'étape est requis",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const toggleCompleted = (step: EtapeOnboarding) => {
    updateMutation.mutate({
      id: step.id,
      data: { terminee: !step.terminee },
    });
  };

  const handleDelete = (stepId: string) => {
    setStepToDelete(stepId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (stepToDelete) {
      deleteMutation.mutate(stepToDelete);
      setDeleteDialogOpen(false);
      setStepToDelete(null);
    }
  };

  const selectedModele = models.find((m) => m.id === selectedModeleId);
  const completedSteps = steps.filter((s) => s.terminee).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Onboarding
          </h1>
          <p className="text-muted-foreground">
            Suivez le processus d'intégration de vos modèles
          </p>
        </div>
        <div className="flex items-center gap-3">
          {models.length > 0 && (
            <Select
              value={selectedModeleId}
              onValueChange={setSelectedModeleId}
            >
              <SelectTrigger
                className="w-[250px] glass-card border-primary/20 rounded-xl"
                data-testid="select-model"
              >
                <SelectValue placeholder="Sélectionner un modèle" />
              </SelectTrigger>
              <SelectContent className="glass-card border-primary/20">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="button-add-step"
                className="rounded-xl neon-glow"
                disabled={!selectedModeleId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add a Step
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20 max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display gradient-text">
                  Ajouter une étape
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="stepName">Nom de l'étape *</Label>
                  <Input
                    id="stepName"
                    data-testid="input-step-name"
                    placeholder="Ex: Signature du contrat"
                    value={formData.stepName}
                    onChange={(e) =>
                      setFormData({ ...formData, stepName: e.target.value })
                    }
                    className="glass-card border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-description"
                    placeholder="Détails de cette étape..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="glass-card border-primary/20 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Input
                    id="dueDate"
                    data-testid="input-due-date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="glass-card border-primary/20"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl"
                    data-testid="button-cancel-step"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl neon-glow"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-step"
                  >
                    {createMutation.isPending ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedModeleId || models.length === 0 ? (
        <Card className="glass-card border-primary/20 rounded-3xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {models.length === 0
              ? "Aucun modèle disponible. Créez d'abord un modèle dans l'onglet Modeles."
              : "Sélectionnez un modèle pour voir son processus d'onboarding."}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="glass-card border-primary/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">
                {selectedModele?.nom}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Progression: {Math.round(progress)}%</span>
                <span>
                  {completedSteps} / {steps.length} étapes complétées
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3 rounded-full" />
            </CardContent>
          </Card>

          {steps.length === 0 ? (
            <Card className="glass-card border-primary/20 rounded-3xl p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Aucune étape d'onboarding pour le moment
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className="rounded-xl neon-glow"
                data-testid="button-add-first-step"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer la première étape
              </Button>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary neon-glow" />
              <div className="space-y-4">
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className={`glass-card rounded-3xl transition-all ${
                          step.terminee
                            ? "border-green-500/50 neon-glow"
                            : "border-primary/20 hover-elevate"
                        }`}
                        data-testid={`card-step-${step.id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                                step.terminee
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-primary/20 text-primary"
                              } neon-border relative z-10`}
                            >
                              {step.terminee ? (
                                <Check className="w-8 h-8" />
                              ) : (
                                <span className="text-2xl font-display font-bold">
                                  {index + 1}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h3
                                  className={`text-xl font-display font-semibold ${
                                    step.terminee
                                      ? "text-green-500"
                                      : "gradient-text"
                                  }`}
                                >
                                  {step.nomEtape}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={step.terminee}
                                    onCheckedChange={() =>
                                      toggleCompleted(step)
                                    }
                                    className="rounded-md"
                                    data-testid={`checkbox-step-${step.id}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(step.id)}
                                    className="rounded-xl h-8 w-8"
                                    data-testid={`button-delete-${step.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {step.description && (
                                <p className="text-muted-foreground mb-3">
                                  {step.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {step.dateEcheance && (
                                  <Badge
                                    variant="outline"
                                    className="rounded-2xl gap-1"
                                  >
                                    <Calendar className="w-3 h-3" />
                                    {new Date(
                                      step.dateEcheance,
                                    ).toLocaleDateString("fr-FR")}
                                  </Badge>
                                )}
                                {step.terminee && (
                                  <Badge className="rounded-2xl bg-green-500/20 text-green-500 border-green-500/30">
                                    Complété
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
