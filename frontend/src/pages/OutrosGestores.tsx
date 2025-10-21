import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';
import HeaderGestor from '@/components/HeaderGestor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';

interface OutroGestor {
  id: number;
  nome: string;
  email: string;
  status: string;
  data_criacao: string;
  total_operadores: number;
  operadores_online: number;
}

const OutrosGestores = () => {
  const { user, token } = useAuth();
  const [gestores, setGestores] = useState<OutroGestor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    buscarOutrosGestores();
  }, [token]);

  const buscarOutrosGestores = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/gestor/outros-gestores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setGestores(data.data);
      } else {
        toast.error('Erro ao carregar outros gestores');
      }
    } catch (error) {
      console.error('Erro ao buscar outros gestores:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Inativo':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'text-green-400 border-green-400';
      case 'Inativo':
        return 'text-red-400 border-red-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando outros gestores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderGestor gestor={user} />
      
      <div className="pt-24 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Cabeçalho da Página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary text-glow mb-2 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Outros Gestores da Empresa
            </h1>
            <p className="text-muted-foreground">
              Visualize outros gestores e suas equipes
            </p>
          </div>

          {/* Lista de Gestores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gestores.map((gestor) => (
              <Card key={gestor.id} className="gaming-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{gestor.nome}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(gestor.status)}
                    >
                      {getStatusIcon(gestor.status)}
                      {gestor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center text-gray-300">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{gestor.email}</span>
                    </div>
                    
                    {/* Data de Criação */}
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Criado em: {new Date(gestor.data_criacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Estatísticas da Equipe */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {gestor.total_operadores}
                          </div>
                          <div className="text-xs text-gray-400">Total Operadores</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {gestor.operadores_online}
                          </div>
                          <div className="text-xs text-gray-400">Online</div>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de Performance */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Performance da Equipe</span>
                        <span className="text-primary font-semibold">
                          {gestor.operadores_online > 0 
                            ? `${Math.round((gestor.operadores_online / gestor.total_operadores) * 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${gestor.total_operadores > 0 
                              ? (gestor.operadores_online / gestor.total_operadores) * 100 
                              : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo Geral */}
          {gestores.length > 0 && (
            <Card className="gaming-card mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Resumo da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {gestores.length}
                    </div>
                    <div className="text-sm text-gray-400">Total de Gestores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {gestores.reduce((total, gestor) => total + gestor.total_operadores, 0)}
                    </div>
                    <div className="text-sm text-gray-400">Total de Operadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {gestores.reduce((total, gestor) => total + gestor.operadores_online, 0)}
                    </div>
                    <div className="text-sm text-gray-400">Operadores Online</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gestores.length === 0 && (
            <Card className="gaming-card">
              <CardContent className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Nenhum outro gestor encontrado
                </h3>
                <p className="text-gray-400">
                  Você é o único gestor da empresa ou não há outros gestores ativos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutrosGestores;
