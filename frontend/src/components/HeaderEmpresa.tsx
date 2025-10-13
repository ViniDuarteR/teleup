import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building2, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderEmpresaProps {
  empresa?: {
    id: number;
    nome: string;
    email: string;
    status: string;
    avatar?: string;
  };
}

const HeaderEmpresa: React.FC<HeaderEmpresaProps> = ({ empresa }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('teleup_token');
    localStorage.removeItem('teleup_user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard-empresa', icon: BarChart3 },
    { label: 'Relatórios', path: '/relatorios-empresa', icon: BarChart3 },
    { label: 'Gestores', path: '/gestores-empresa', icon: Users },
    { label: 'Configurações', path: '/configuracoes-empresa', icon: Settings },
  ];

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo e Nome da Empresa */}
          <div className="flex items-center space-x-4">
            <Building2 className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">
                {empresa?.nome || 'Empresa'}
              </h1>
              <p className="text-sm text-gray-300">Portal Empresarial</p>
            </div>
          </div>

          {/* Status da Empresa */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="outline" className="text-green-400 border-green-400">
              {empresa?.status || 'Ativo'}
            </Badge>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Menu de Usuário */}
          <div className="hidden md:flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-blue-400/50">
              <AvatarImage 
                src={empresa?.avatar || '/placeholder.svg'} 
                alt={empresa?.nome || 'Empresa'} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                {empresa?.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'E'}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm text-white">{empresa?.nome || 'Empresa'}</p>
              <p className="text-xs text-gray-400">{empresa?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 border-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-gray-300 mb-2">
                  <p className="text-white">{empresa?.email}</p>
                  <p className="text-xs text-gray-400">Empresa</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderEmpresa;
