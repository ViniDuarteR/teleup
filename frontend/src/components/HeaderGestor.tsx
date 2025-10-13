import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  Gift, 
  Settings, 
  LogOut,
  Activity,
  TrendingUp,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderGestorProps {
  gestor: {
    nome: string;
    email: string;
    avatar?: string;
  };
}

const HeaderGestor = ({ gestor }: HeaderGestorProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 gaming-card-glow border-b">
      <div className="flex items-center justify-between p-4">
        {/* Logo e Navegação */}
        <div className="flex items-center gap-4">
          <Link to="/gestor" className="flex items-center gap-3 hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-primary text-glow">
              TeleUp
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Gestor</span>
            </div>
          </Link>
          <div className="h-6 w-px bg-border"></div>
          
          {/* Menu de Navegação para Gestores */}
          <nav className="flex items-center gap-2">
            <Link to="/gestor">
              <Button 
                variant={location.pathname === '/gestor' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/gestor' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/gestor/operadores">
              <Button 
                variant={location.pathname === '/gestor/operadores' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/gestor/operadores' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <Users className="w-4 h-4 mr-2" />
                Operadores
              </Button>
            </Link>
            
            <Link to="/gestor/recompensas">
              <Button 
                variant={location.pathname === '/gestor/recompensas' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/gestor/recompensas' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <Gift className="w-4 h-4 mr-2" />
                Recompensas
              </Button>
            </Link>
            
            <Link to="/gestor/relatorios">
              <Button 
                variant={location.pathname === '/gestor/relatorios' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/gestor/relatorios' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </Link>
          </nav>
        </div>

        {/* Informações do gestor */}
        <div className="flex items-center gap-6">
          {/* Avatar e nome */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary/50">
              <AvatarImage src={gestor?.avatar} alt={gestor?.nome || 'Gestor'} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {gestor?.nome?.split(' ').map(n => n[0]).join('') || 'G'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{gestor?.nome || 'Gestor'}</h3>
              <p className="text-sm text-muted-foreground">Gestor</p>
            </div>
          </div>

          {/* Status e ações */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-success">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Online</span>
            </div>

            {/* Botão de Logout */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:border-destructive hover:scale-105 transition-all duration-300 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderGestor;
