import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function SOPList() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  const { data: sops = [] } = useQuery<any[]>({
    queryKey: ["/api/sops"],
  });

  const categories = [
    "Tous",
    ...Array.from(new Set(sops.map((s: any) => s.category))),
  ];

  const handleAddSOP = () => {
    toast({
      title: "Ajouter un SOP",
      description: "Fonctionnalité d'ajout à venir.",
    });
  };

  const filteredSOPs =
    selectedCategory === "Tous"
      ? sops
      : sops.filter((sop) => sop.category === selectedCategory);

  return (
    <Card
      className="backdrop-blur-md bg-black/20 border-violet-500/20"
      data-testid="card-sop-list"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Processus (SOP)</CardTitle>
          <Button onClick={handleAddSOP} data-testid="button-add-sop">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              data-testid={`button-filter-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredSOPs.map((sop) => (
            <div
              key={sop.id}
              className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-violet-500/10 hover-elevate"
              data-testid={`sop-item-${sop.id}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">{sop.title}</div>
                  <Badge variant="outline" className="mt-1">
                    {sop.category}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {sop.type === "external" && sop.url ? (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={sop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`button-open-${sop.id}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-download-${sop.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
