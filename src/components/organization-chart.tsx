import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MembreEquipe } from "@shared/schema";

interface OrganizationChartProps {
  members: MembreEquipe[];
  onMemberClick: (member: MembreEquipe) => void;
  selectedMemberId?: string;
}

export function OrganizationChart({
  members,
  onMemberClick,
  selectedMemberId,
}: OrganizationChartProps) {
  if (members.length === 0) {
    return null;
  }

  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const calculatePosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  // Find CEO (first member without managerId, or first member if none found)
  const ceos = members.filter((m) => !m.managerId);
  const ceo = ceos.length > 0 ? ceos[0] : members[0];

  // All other members that are not the selected CEO
  const otherMembers = members.filter((m) => m.id !== ceo.id);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <AnimatePresence>
          {ceo &&
            otherMembers.map((member, index) => {
              const pos = calculatePosition(index, otherMembers.length);
              return (
                <motion.line
                  key={`line-${member.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              );
            })}
        </AnimatePresence>
      </svg>

      <AnimatePresence>
        {ceo && (
          <motion.div
            key={`center-${ceo.id}`}
            className="absolute"
            style={{
              left: centerX,
              top: centerY,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.div
              className={`cursor-pointer ${
                selectedMemberId === ceo.id ? "neon-glow" : ""
              }`}
              onClick={() => onMemberClick(ceo)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`org-chart-member-${ceo.id}`}
            >
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/50 shadow-2xl shadow-primary/20">
                  <AvatarImage src={ceo.urlPhoto || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">
                    {ceo.initiales}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="glass-card rounded-2xl px-3 py-1 text-xs font-display font-semibold">
                    {ceo.nom}
                  </div>
                  <div className="text-center text-[10px] text-muted-foreground mt-1">
                    {ceo.role}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {otherMembers.map((member, index) => {
          const pos = calculatePosition(index, otherMembers.length);
          return (
            <motion.div
              key={`member-${member.id}`}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
              initial={{
                scale: 0,
                opacity: 0,
                x: centerX - pos.x,
                y: centerY - pos.y,
              }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 + index * 0.1,
              }}
            >
              <motion.div
                className={`cursor-pointer ${
                  selectedMemberId === member.id ? "neon-glow" : ""
                }`}
                onClick={() => onMemberClick(member)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`org-chart-member-${member.id}`}
              >
                <div className="relative">
                  <Avatar className="w-20 h-20 border-3 border-primary/40 shadow-xl shadow-primary/10">
                    <AvatarImage src={member.urlPhoto || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-display text-xl">
                      {member.initiales}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="glass-card rounded-xl px-2 py-0.5 text-[10px] font-display font-semibold">
                      {member.nom}
                    </div>
                    <div className="text-center text-[8px] text-muted-foreground mt-0.5">
                      {member.pourcentage}%
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
