import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AISearchBar() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (q: string) => {
      return apiRequest("/api/ai/query", "POST", { query: q });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Réponse IA",
        description: data.response,
        duration: 5000,
      });
      setQuery("");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      aiMutation.mutate(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
        <Input
          type="text"
          placeholder="Pose une question à l'IA..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-black/40 border-violet-500/30 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          data-testid="input-ai-search"
          disabled={aiMutation.isPending}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          data-testid="button-ai-search"
        >
          <Search className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        </button>
      </div>
    </form>
  );
}
