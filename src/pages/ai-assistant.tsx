import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour! Je suis votre assistant IA. Je peux vous aider à analyser vos données, optimiser vos stratégies et répondre à vos questions sur OnlyTrack.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest("/api/ai/query", "POST", { query });
    },
    onSuccess: (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.response || "Désolé, je n'ai pas pu traiter votre demande.",
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de contacter l'assistant IA",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    queryMutation.mutate(input);
    setInput("");
  };

  const suggestedQuestions = [
    "Quel est le modèle le plus performant?",
    "Analyse les tendances de revenus",
    "Quels scripts DM ont le meilleur taux de conversion?",
    "Résume les performances de cette semaine",
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Votre assistant intelligent pour optimiser vos performances
          </p>
        </div>
        <Badge
          variant="secondary"
          className="rounded-xl flex items-center gap-2"
        >
          <Sparkles className="w-3 h-3" />
          Powered by OpenAI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="glass-card rounded-3xl">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="font-display gradient-text flex items-center gap-2">
                <Bot className="w-6 h-6" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-6">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${index}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.role === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/20 text-secondary-foreground"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl p-4 ${
                            message.role === "user"
                              ? "glass-card"
                              : "bg-secondary/20"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {message.timestamp.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {queryMutation.isPending && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-2xl bg-secondary/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="rounded-2xl p-4 bg-secondary/20">
                        <p className="text-sm text-muted-foreground">
                          En train de réfléchir...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-primary/10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez une question à l'assistant IA..."
                    className="rounded-xl bg-black/40 border-primary/20"
                    disabled={queryMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-xl neon-glow"
                    disabled={queryMutation.isPending || !input.trim()}
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card rounded-3xl sticky top-8">
            <CardHeader>
              <CardTitle className="font-display gradient-text text-base">
                Questions suggérées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 rounded-xl"
                  onClick={() => setInput(question)}
                  data-testid={`suggested-question-${index}`}
                >
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
