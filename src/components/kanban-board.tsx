import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Column {
  id: string;
  title: string;
  cards: any[];
}

export function KanbanBoard() {
  const [draggedCard, setDraggedCard] = useState<{
    columnId: string;
    cardId: string;
  } | null>(null);

  const { data: candidates = [] } = useQuery<any[]>({
    queryKey: ["/api/dm-candidates"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/dm-candidates/${id}`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dm-candidates"] });
    },
  });

  const columns: Column[] = [
    {
      id: "sent",
      title: "Envoyé",
      cards: candidates.filter((c: any) => c.status === "sent"),
    },
    {
      id: "response",
      title: "Réponse",
      cards: candidates.filter((c: any) => c.status === "response"),
    },
    {
      id: "interested",
      title: "Intéressée",
      cards: candidates.filter((c: any) => c.status === "interested"),
    },
    {
      id: "closing",
      title: "Closing",
      cards: candidates.filter((c: any) => c.status === "closing"),
    },
    {
      id: "signed",
      title: "Signée",
      cards: candidates.filter((c: any) => c.status === "signed"),
    },
  ];

  const handleDragStart = (columnId: string, cardId: string) => {
    setDraggedCard({ columnId, cardId });
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedCard) return;

    const card = candidates.find((c: any) => c.id === draggedCard.cardId);
    if (card && card.status !== targetColumnId) {
      updateMutation.mutate({ id: card.id, status: targetColumnId });
    }

    setDraggedCard(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" data-testid="kanban-board">
      {columns.map((column) => (
        <div
          key={column.id}
          className="min-w-[280px] flex-1"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(column.id)}
        >
          <Card className="backdrop-blur-md bg-black/20 border-violet-500/20 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-display flex items-center justify-between">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {column.cards.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(column.id, card.id)}
                  className={cn(
                    "p-3 rounded-lg bg-card border border-violet-500/20 cursor-move hover-elevate active-elevate-2",
                    draggedCard?.cardId === card.id && "opacity-50",
                  )}
                  data-testid={`kanban-card-${card.id}`}
                >
                  <div className="font-medium text-sm">{card.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {card.platform}
                  </div>
                  {card.followers && (
                    <div className="text-xs text-primary mt-1">
                      {card.followers} followers
                    </div>
                  )}
                  {card.script && (
                    <Badge variant="outline" className="mt-2">
                      {card.script}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
