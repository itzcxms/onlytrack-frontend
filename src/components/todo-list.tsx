import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import type { Tache } from "@shared/schema";

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const { toast } = useToast();

  const { data: todos = [] } = useQuery<Tache[]>({
    queryKey: ["/api/todos"],
  });

  const createMutation = useMutation({
    mutationFn: async (texte: string) => {
      return apiRequest("/api/todos", "POST", { texte, terminee: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setNewTodo("");
      toast({
        title: "Tâche ajoutée",
        description: "La tâche a été ajoutée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la tâche",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, terminee }: { id: string; terminee: boolean }) => {
      return apiRequest(`/api/todos/${id}`, "PATCH", { terminee });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/todos/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      createMutation.mutate(newTodo);
    }
  };

  const toggleTodo = (id: string, terminee: boolean) => {
    updateMutation.mutate({ id, terminee: !terminee });
  };

  const deleteTodo = (id: string) => {
    deleteMutation.mutate(id);
  };

  const incompleteTodos = todos.filter((t) => !t.terminee);

  return (
    <Card className="border-card-border" data-testid="card-todo-list">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-display text-xl">To-Do List</CardTitle>
        <Badge variant="secondary" className="rounded-full">
          {incompleteTodos.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nouvelle tâche..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            className="bg-background border-border"
            data-testid="input-new-todo"
          />
          <Button
            onClick={handleAddTodo}
            size="icon"
            variant="default"
            data-testid="button-add-todo"
            disabled={createMutation.isPending}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-card-border hover-elevate"
              data-testid={`todo-item-${todo.id}`}
            >
              <Checkbox
                checked={todo.terminee}
                onCheckedChange={() => toggleTodo(todo.id, todo.terminee)}
                data-testid={`checkbox-todo-${todo.id}`}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-1">
                <p
                  className={`text-sm ${todo.terminee ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {todo.texte}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={todo.terminee ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {todo.terminee ? "Terminé" : "En cours"}
                  </Badge>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteTodo(todo.id)}
                data-testid={`button-delete-todo-${todo.id}`}
                disabled={deleteMutation.isPending}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune tâche pour le moment
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
