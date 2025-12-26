import { SOPList } from "@/components/sop-list";

export default function SOP() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Processus (SOP)
        </h1>
        <p className="text-muted-foreground">
          Documentation et processus internes de l'agence
        </p>
      </div>

      <SOPList />
    </div>
  );
}
