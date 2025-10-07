import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import SimpleHome from "./pages/SimpleHome";
import Login from "./pages/Login";
import Teste from "./pages/Teste";
import Debug from "./pages/Debug";
import DashboardOperador from "./pages/DashboardOperador";
import PerfilOperador from "./pages/PerfilOperador";
import MetasPessoais from "./pages/MetasPessoais";
import PainelGestor from "./pages/PainelGestor";
import MonitorOperadores from "./pages/MonitorOperadores";
import GerenciarRecompensas from "./pages/GerenciarRecompensas";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import GerenciarGestores from "./pages/GerenciarGestores";
import LojaRecompensas from "./pages/LojaRecompensas";
import GaleriaConquistas from "./pages/GaleriaConquistas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<SimpleHome />} />
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/teste" element={<Teste />} />
            <Route path="/debug" element={<Debug />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="operador">
                  <DashboardOperador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute requiredRole="operador">
                  <PerfilOperador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/metas" 
              element={
                <ProtectedRoute requiredRole="operador">
                  <MetasPessoais />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <PainelGestor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/operadores" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <MonitorOperadores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/recompensas" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarRecompensas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarUsuarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestores" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarGestores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loja" 
              element={
                <ProtectedRoute>
                  <LojaRecompensas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/conquistas" 
              element={
                <ProtectedRoute>
                  <GaleriaConquistas />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
