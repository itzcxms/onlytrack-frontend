import { StatCard } from "../stat-card";
import { DollarSign, Heart, Eye, Users } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8 bg-background">
      <StatCard
        title="Chiffre d'affaires"
        value="45 280 €"
        trend={12.5}
        icon={<DollarSign className="w-5 h-5" />}
      />
      <StatCard
        title="Likes totaux"
        value="234.5k"
        trend={8.2}
        icon={<Heart className="w-5 h-5" />}
      />
      <StatCard
        title="Vues"
        value="1.2M"
        trend={-3.1}
        icon={<Eye className="w-5 h-5" />}
      />
      <StatCard
        title="Conversions"
        value="89"
        trend={15.3}
        icon={<Users className="w-5 h-5" />}
      />
    </div>
  );
}
