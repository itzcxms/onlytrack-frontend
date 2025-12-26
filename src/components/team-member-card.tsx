import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMemberCardProps {
  name: string;
  role: string;
  revenue?: string;
  tasks?: number;
  initials: string;
}

export function TeamMemberCard({
  name,
  role,
  revenue,
  tasks,
  initials,
}: TeamMemberCardProps) {
  const { toast } = useToast();

  const handleAssignTask = () => {
    toast({
      title: "Assignation de tâche",
      description: `Tâche assignée à ${name}`,
    });
  };

  return (
    <Card
      className="backdrop-blur-md bg-black/20 border-violet-500/20 hover-elevate"
      data-testid={`card-team-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarFallback className="bg-primary/20 text-primary font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {revenue && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Revenus</span>
              <span className="font-display text-primary">{revenue}</span>
            </div>
          )}
          {tasks !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tâches</span>
              <Badge variant="secondary">{tasks}</Badge>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={handleAssignTask}
          data-testid={`button-assign-task-${name.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assigner une tâche
        </Button>
      </CardContent>
    </Card>
  );
}
