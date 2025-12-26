// ==========================================
// COMPOSANT DE PROTECTION DES ROUTES
// Redirige vers /login si non authentifié
// ==========================================

import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

/**
 * Props du composant ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Contenu à afficher si l'utilisateur est authentifié */
  children: React.ReactNode;
  /** Rôles requis pour accéder à cette route (optionnel) */
  requireRole?: Array<"owner" | "member" | "model">;
}

/**
 * Composant de route protégée
 * 
 * Vérifie l'authentification avant d'afficher le contenu.
 * Redirige vers /login si l'utilisateur n'est pas connecté.
 * Affiche un message d'erreur si le rôle est insuffisant.
 * 
 * @component
 * @param {ProtectedRouteProps} props - Props du composant
 * @returns {JSX.Element} Route protégée ou redirection
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Avec vérification de rôle
 * <ProtectedRoute requireRole={['owner']}>
 *   <TeamManagement />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, on ne rend rien (la redirection est gérée par useEffect)
  if (!user) {
    return null;
  }

  // Vérifier les rôles requis
  if (requireRole && !requireRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Accès Refusé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
          <a href="/" className="text-primary hover:underline">
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
