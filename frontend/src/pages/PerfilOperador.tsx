import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Trophy, 
  Star, 
  Clock, 
  Phone, 
  Calendar,
  Award,
  Crown,
  Target
} from "lucide-react";
import { toast } from "sonner";

interface Estatisticas {
  total_chamadas: number;
  tempo_total_minutos: number;
  satisfacao_media: number;
  taxa_resolucao: number;
  pontos_ganhos: number;
  conquistas_desbloqueadas: number;
}

const PerfilOperador = () => {
  const { user, token } = useAuth();
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Buscar estatísticas do operador
  const buscarEstatisticas = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      // Buscar estatísticas de chamadas
      const statsResponse = await fetch(`${API_BASE_URL}/chamadas/estatisticas?periodo=mes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setEstatisticas({
          total_chamadas: statsData.data.total_chamadas,
          tempo_total_minutos: statsData.data.tempo_total_minutos,
          satisfacao_media: statsData.data.satisfacao_media,
          taxa_resolucao: statsData.data.taxa_resolucao,
          pontos_ganhos: statsData.data.pontos_ganhos,
          conquistas_desbloqueadas: 0 // Será implementado depois
        });
      }

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarEstatisticas();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  const xpPercentage = (user.xp_atual / user.xp_proximo_nivel) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header operador={user} />
      
      <div className="p-6 pt-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header do Perfil */}
          <Card className="gaming-card-glow">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/50">
                  <AvatarImage src={user.avatar} alt={user.nome} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user.nome.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{user.nome}</h1>
                  <p className="text-muted-foreground mb-4">{user.email}</p>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Crown className="w-4 h-4 mr-2" />
                      Nível {user.nivel}
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <Star className="w-4 h-4 mr-2" />
                      {user.pontos_totais.toLocaleString()} pontos
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-2">Progresso para próximo nível</div>
                  <div className="w-48">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{user.xp_atual} XP</span>
                      <span>{user.xp_proximo_nivel} XP</span>
                    </div>
                    <Progress value={xpPercentage} className="h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          {estatisticas && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {estatisticas.total_chamadas}
                  </div>
                  <div className="text-sm text-muted-foreground">Chamadas este mês</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {Math.floor(estatisticas.tempo_total_minutos / 60)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo total</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-warning mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {estatisticas.satisfacao_media.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Satisfação média</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-success mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {estatisticas.taxa_resolucao}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de resolução</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Conquistas e Metas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-xp" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="w-6 h-6 text-xp" />
                    <div>
                      <div className="font-semibold">Primeiro Passo</div>
                      <div className="text-sm text-muted-foreground">Atenda sua primeira chamada</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="w-6 h-6 text-xp" />
                    <div>
                      <div className="font-semibold">Atendente Dedicado</div>
                      <div className="text-sm text-muted-foreground">Atenda 50 chamadas</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Todas as Conquistas
                </Button>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Metas Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Chamadas este mês</span>
                      <span>15/20</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Satisfação média</span>
                      <span>4.2/4.5</span>
                    </div>
                    <Progress value={93} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tempo online</span>
                      <span>6h/8h</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Todas as Metas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilOperador;
