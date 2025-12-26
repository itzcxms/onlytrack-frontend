import { RevenueChart } from "../revenue-chart";

const mockData = [
  { date: "Lun", revenus: 4200 },
  { date: "Mar", revenus: 3800 },
  { date: "Mer", revenus: 5100 },
  { date: "Jeu", revenus: 4600 },
  { date: "Ven", revenus: 6200 },
  { date: "Sam", revenus: 7800 },
  { date: "Dim", revenus: 5900 },
];

export default function RevenueChartExample() {
  return (
    <div className="p-8 bg-background">
      <RevenueChart data={mockData} />
    </div>
  );
}
