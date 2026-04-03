import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CadastroPage from "@/pages/Cadastro";
import ClientesPage from "@/pages/Clientes";
import ProdutosPage from "@/pages/Produtos";
import VendasPage from "@/pages/Vendas";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><CadastroPage /></PublicRoute>} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/vendas" element={<VendasPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
