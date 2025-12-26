import { TeamMemberCard } from "../team-member-card";

export default function TeamMemberCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-background">
      <TeamMemberCard
        name="Sophie Martin"
        role="Manager"
        revenue="12 500 €"
        tasks={8}
        initials="SM"
      />
      <TeamMemberCard
        name="Marc Dubois"
        role="Tracker"
        revenue="8 200 €"
        tasks={5}
        initials="MD"
      />
      <TeamMemberCard
        name="Julie Bernard"
        role="Admin"
        revenue="15 800 €"
        tasks={12}
        initials="JB"
      />
    </div>
  );
}
