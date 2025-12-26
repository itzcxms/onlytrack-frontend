import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/MainLayout";

// Import des pages existantes
import Dashboard from "./pages/dashboard";
import Models from "./pages/models";
import Onboarding from "./pages/onboarding";
import Analytics from "./pages/analytics";
import Affiliation from "./pages/affiliation";
import AIAssistant from "./pages/ai-assistant";
import SOP from "./pages/sop";
import Terms from "./pages/terms";
import Team from "./pages/team";
import Recruitment from "./pages/recruitment";
import Inspiration from "./pages/inspiration";
import Accounting from "./pages/accounting";
import Tracking from "./pages/tracking";
import MonCompte from "./pages/mon-compte";

// Pages d'authentification (publiques)
import LoginPage from "./pages/login";
import PricingPage from "./pages/pricing";

// Pages admin
import AdminDashboard from "./pages/admin/index";
import AdminAgences from "./pages/admin/agences";
import AdminUtilisateurs from "./pages/admin/utilisateurs";
import AdminAdmins from "./pages/admin/admins";
import AdminAnalytics from "./pages/admin/analytics";
import AdminAccesTemporaires from "./pages/admin/acces-temporaires";
import AdminLoginPage from "./pages/admin-login";

// Pages métier
import AccesTemporaires from "./pages/acces-temporaires";
import DemoAccessPage from "./pages/demo";

function Router() {
  return (
    <Switch>
      {/* Routes publiques */}
      <Route path="/login" component={LoginPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/terms" component={Terms} />
      <Route path="/demo/:token" component={DemoAccessPage} />

      {/* Routes admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/agences" component={AdminAgences} />
      <Route path="/admin/utilisateurs" component={AdminUtilisateurs} />
      <Route path="/admin/admins" component={AdminAdmins} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/acces-temporaires" component={AdminAccesTemporaires} />

      {/* Routes accès temporaires */}
      <Route path="/acces-temporaires">
        <ProtectedRoute requireRole={["owner"]}>
          <MainLayout>
            <AccesTemporaires />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      {/* Routes protégées avec Layout */}
      <Route path="/">
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/modeles">
        <ProtectedRoute>
          <MainLayout>
            <Models />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/onboarding">
        <ProtectedRoute>
          <MainLayout>
            <Onboarding />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/analytics">
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/affiliation">
        <ProtectedRoute>
          <MainLayout>
            <Affiliation />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/assistant-ia">
        <ProtectedRoute>
          <MainLayout>
            <AIAssistant />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/processus">
        <ProtectedRoute>
          <MainLayout>
            <SOP />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/equipe">
        <ProtectedRoute requireRole={["owner"]}>
          <MainLayout>
            <Team />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/recrutement">
        <ProtectedRoute>
          <MainLayout>
            <Recruitment />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/inspiration">
        <ProtectedRoute>
          <MainLayout>
            <Inspiration />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/comptabilite">
        <ProtectedRoute>
          <MainLayout>
            <Accounting />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/tracking">
        <ProtectedRoute>
          <MainLayout>
            <Tracking />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/mon-compte">
        <ProtectedRoute>
          <MainLayout>
            <MonCompte />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      {/* Route par défaut - 404 */}
      <Route>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4">404</h1>
              <p className="text-xl text-muted-foreground">Page non trouvée</p>
              <a
                href="/"
                className="text-primary hover:underline mt-4 inline-block"
              >
                Retour au dashboard
              </a>
            </div>
          </div>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
