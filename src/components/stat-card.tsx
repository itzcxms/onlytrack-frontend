import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  iconColor = "bg-primary/10 text-primary",
  className,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-muted-foreground";
    if (trend > 0) return "text-chart-2";
    return "text-destructive";
  };

  return (
    <Card
      className={cn(
        "glass-card neon-glow-hover rounded-3xl transition-all duration-300",
        className,
      )}
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div
              className="text-3xl font-display font-bold gradient-text"
              data-testid={`text-${title.toLowerCase().replace(/\s+/g, "-")}-value`}
            >
              {value}
            </div>
          </div>
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-2xl neon-glow",
                iconColor,
              )}
            >
              {icon}
            </div>
          )}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              getTrendColor(),
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
