import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Phone, Store, User, Target, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  operador: {
    nome: string;
    avatar: string;
    nivel: number;
    xp_atual: number;
    xp_proximo_nivel: number;
    pontos_totais: number;
    tempo_online: string;
  };
}

const Header = ({ operador }: HeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const xpPercentage = (operador.xp_atual / operador.xp_proximo_nivel) * 100;

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
          <Link to="/dashboard" className="flex items-center gap-3 hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-primary text-glow">
              TeleUp
            </div>
          </Link>
          <div className="h-6 w-px bg-border"></div>
          
          {/* Menu de Navegação */}
          <nav className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button 
                variant={location.pathname === '/dashboard' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/dashboard' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <Phone className="w-4 h-4 mr-2" />
                Discagem
              </Button>
            </Link>
            
            <Link to="/loja">
              <Button 
                variant={location.pathname === '/loja' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/loja' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <Store className="w-4 h-4 mr-2" />
                Loja
              </Button>
            </Link>
            
            <Link to="/perfil">
              <Button 
                variant={location.pathname === '/perfil' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/perfil' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
            </Link>
            
            <Link to="/metas">
              <Button 
                variant={location.pathname === '/metas' ? "default" : "ghost"} 
                size="sm" 
                className={location.pathname === '/metas' ? "btn-gaming" : "text-muted-foreground hover:text-primary"}
              >
                <Target className="w-4 h-4 mr-2" />
                Metas
              </Button>
            </Link>
          </nav>
        </div>

        {/* Informações do operador */}
        <div className="flex items-center gap-6">
          {/* Avatar e nome */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary/50">
              <AvatarImage 
                src={operador.avatar || '/placeholder.svg'} 
                alt={operador.nome || 'Usuário'} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                {operador.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{operador.nome || 'Usuário'}</h3>
              <p className="text-sm text-muted-foreground">Online: {operador.tempo_online || '0 min'}</p>
            </div>
          </div>

          {/* Nível e XP */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-xp text-glow">
                Nv.{operador.nivel}
              </div>
              <div className="text-xs text-muted-foreground">
                {operador.pontos_totais?.toLocaleString() || '0'} pts
              </div>
            </div>
            
            <div className="w-48">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{operador.xp_atual} XP</span>
                <span>{operador.xp_proximo_nivel} XP</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full xp-bar transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
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
    </header>
  );
};

export default Header;
