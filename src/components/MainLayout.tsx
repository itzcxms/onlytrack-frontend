// ==========================================
// LAYOUT PRINCIPAL
// Structure commune pour toutes les pages protégées
// ==========================================

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";

/**
 * Props du composant MainLayout
 */
interface MainLayoutProps {
  /** Contenu de la page à afficher */
  children: React.ReactNode;
}

/**
 * Layout principal de l'application
 * 
 * Fournit une structure commune pour toutes les pages protégées avec :
 * - Une sidebar collapsible (AppSidebar)
 * - Un header avec bouton toggle sidebar
 * - Une zone de contenu principale
 * - Vérification de l'abonnement (SubscriptionGuard)
 * 
 * @component
 * @param {MainLayoutProps} props - Props du composant
 * @returns {JSX.Element} Layout avec sidebar
 * 
 * @example
 * <MainLayout>
 *   <Dashboard />
 * </MainLayout>
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SubscriptionGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-primary/10 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SubscriptionGuard>
  );
}
