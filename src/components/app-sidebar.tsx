// ==========================================
// SIDEBAR DE L'APPLICATION
// Navigation principale et informations utilisateur
// ==========================================

import {
  LayoutDashboard,
  TrendingUp,
  Link2,
  Users,
  UserCircle2,
  GraduationCap,
  UserPlus,
  Wallet,
  MessageSquare,
  Lightbulb,
  FileText,
  Bot,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Items de menu de la sidebar
 * Définit toutes les pages accessibles de l'application
 */
const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Tracking Links", url: "/tracking", icon: Link2 },
  { title: "Équipe", url: "/equipe", icon: Users },
  { title: "Models", url: "/modeles", icon: UserCircle2 },
  { title: "Onboarding", url: "/onboarding", icon: GraduationCap },
  { title: "Affiliation", url: "/affiliation", icon: UserPlus },
  { title: "Comptabilité", url: "/comptabilite", icon: Wallet },
  { title: "Recrutement", url: "/recrutement", icon: MessageSquare },
  { title: "Inspiration", url: "/inspiration", icon: Lightbulb },
  { title: "Processus", url: "/processus", icon: FileText },
  { title: "Assistant IA", url: "/assistant-ia", icon: Bot },
];

/**
 * Sidebar principale de l'application
 * 
 * Affiche la navigation et les informations de l'utilisateur connecté.
 * Fournit :
 * - Logo et titre de l'application
 * - Menu de navigation avec highlighting de la route active
 * - Informations utilisateur (avatar, nom, email)
 * - Bouton de déconnexion
 * 
 * @component
 * @returns {JSX.Element} Sidebar complète avec navigation
 * 
 * @example
 * <AppSidebar />
 */
export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  }

  // Initiales de l'utilisateur
  const initials = user
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : "AD";

  const displayName = user ? `${user.prenom} ${user.nom}` : "Admin";

  const displayEmail = user?.email || "admin@onlytrack.com";

  return (
    <Sidebar className="glass-sidebar">
      <SidebarContent>
        <div className="px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-primary-foreground font-bold text-sm neon-glow">
              OT
            </div>
            <span className="font-display text-xl font-bold gradient-text">
              OnlyTrack
            </span>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent className="px-3">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-primary/20 text-primary neon-border"
                          : "hover:bg-white/5 neon-glow-hover"
                      }`}
                      data-testid={`nav-${item.url.slice(1) || "dashboard"}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/10 p-4">
        <div className="space-y-2">
          {/* User info */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5">
            <Avatar className="w-10 h-10 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
