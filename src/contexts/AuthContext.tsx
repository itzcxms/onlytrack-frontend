// ==========================================
// CONTEXTE D'AUTHENTIFICATION
// Gestion globale de l'état utilisateur connecté
// ==========================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ==========================================
// TYPES
// ==========================================

/**
 * Représente un utilisateur authentifié
 */
interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: "owner" | "member" | "model";
  agenceId: string;
}

/**
 * Interface du contexte d'authentification
 * Fournit l'état de l'utilisateur et les méthodes d'auth
 */
interface AuthContextType {
  /** Utilisateur actuellement connecté ou null */
  user: User | null;
  /** Indique si les données utilisateur sont en cours de chargement */
  loading: boolean;
  /** Fonction de connexion avec email/password */
  login: (email: string, password: string) => Promise<void>;
  /** Fonction de déconnexion */
  logout: () => Promise<void>;
  /** Rafraîchir les données de l'utilisateur */
  refreshUser: () => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// AUTH PROVIDER
// ==========================================

/**
 * Provider du contexte d'authentification
 * Enveloppe l'application pour fournir l'état d'auth à tous les composants
 *
 * @component
 * @param {ReactNode} children - Composants enfants
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * Récupère les informations de l'utilisateur connecté depuis l'API
   * Utilise le cookie JWT pour l'authentification
   */
  async function refreshUser() {
    try {
      const res = await fetch("/api/auth/moi", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Connecte un utilisateur avec email et mot de passe
   * Stocke le JWT dans un cookie httpOnly
   *
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @throws {Error} Si les identifiants sont incorrects
   */
  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/connexion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Connexion échouée");
    }

    const data = await res.json();
    setUser(data.user);
  }

  /**
   * Déconnecte l'utilisateur actuel
   * Supprime le cookie JWT et réinitialise l'état
   */
  async function logout() {
    await fetch("/api/auth/deconnexion", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOK PERSONNALISÉ
// ==========================================

/**
 * Hook pour accéder au contexte d'authentification
 * Doit être utilisé à l'intérieur d'un AuthProvider
 *
 * @returns {AuthContextType} Contexte d'authentification
 * @throws {Error} Si utilisé en dehors d'un AuthProvider
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
