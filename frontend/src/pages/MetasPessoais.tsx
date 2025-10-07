import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Trophy, 
  Clock, 
  Phone, 
  Star, 
  CheckCircle2,
  Calendar,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface Meta {
  id: number;
  tipo: string;
  valor_meta: number;
  valor_atual: number;
  periodo: string;
  concluida: boolean;
  pontos_recompensa: number;
  data_inicio: string;
  data_fim: string;
}

const MetasPessoais = () => {
  const { user, token } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Buscar metas do operador
  const buscarMetas = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/gamificacao/metas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setMetas(data.data);
      }

    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarMetas();
  }, [token]);

  const getIconeMeta = (tipo: string) => {
    switch (tipo) {
      case 'Chamadas':
        return <Phone className="w-5 h-5" />;
      case 'Tempo':
        return <Clock className="w-5 h-5" />;
      case 'Satisfação':
        return <Star className="w-5 h-5" />;
      case 'Resolução':
        return <Target className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getCorMeta = (tipo: string) => {
    switch (tipo) {
      case 'Chamadas':
        return 'text-primary';
      case 'Tempo':
        return 'text-secondary';
      case 'Satisfação':
        return 'text-warning';
      case 'Resolução':
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const calcularProgresso = (atual: number, meta: number) => {
    return Math.min((atual / meta) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando metas...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <Header operador={user} />
      
      <div className="p-6 pt-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Metas Pessoais</h1>
              <p className="text-muted-foreground">Acompanhe seu progresso e conquiste seus objetivos</p>
            </div>
            <Button className="btn-gaming">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Conquistas
            </Button>
          </div>

          {/* Resumo das Metas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metas.length}
                </div>
                <div className="text-sm text-muted-foreground">Metas Ativas</div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metas.filter(m => m.concluida).length}
                </div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-xp mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metas.reduce((acc, meta) => acc + meta.pontos_recompensa, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Pontos em Jogo</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Metas */}
          <div className="space-y-4">
            {!metas || metas.length === 0 ? (
              <Card className="gaming-card">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma meta ativa</h3>
                  <p className="text-muted-foreground mb-4">
                    Suas metas aparecerão aqui quando forem atribuídas pelo gestor.
                  </p>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            ) : (
              metas.map((meta) => {
                const progresso = calcularProgresso(meta.valor_atual, meta.valor_meta);
                const isConcluida = meta.concluida || progresso >= 100;

                return (
                  <Card key={meta.id} className={`gaming-card ${isConcluida ? 'ring-2 ring-success' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getCorMeta(meta.tipo)} bg-muted/50`}>
                            {getIconeMeta(meta.tipo)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground capitalize">
                              {meta.tipo} - {meta.periodo}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {meta.data_inicio} até {meta.data_fim}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={isConcluida ? "default" : "secondary"} className="mb-2">
                            {isConcluida ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Concluída
                              </>
                            ) : (
                              'Em Andamento'
                            )}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            +{meta.pontos_recompensa} pontos
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{meta.valor_atual?.toFixed(1) || '0.0'} / {meta.valor_meta || 0} {meta.tipo.toLowerCase()}</span>
                        </div>
                        
                        <Progress 
                          value={progresso} 
                          className="h-3"
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progresso?.toFixed(1) || '0.0'}% completo</span>
                          <span>
                            {meta.valor_meta - meta.valor_atual > 0 
                              ? `Faltam ${((meta.valor_meta || 0) - (meta.valor_atual || 0)).toFixed(1)}`
                              : 'Meta atingida!'
                            }
                          </span>
                        </div>
                      </div>

                      {isConcluida && (
                        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                          <div className="flex items-center gap-2 text-success">
                            <Trophy className="w-4 h-4" />
                            <span className="font-semibold">Parabéns! Meta concluída!</span>
                          </div>
                          <p className="text-sm text-success/80 mt-1">
                            Você ganhou {meta.pontos_recompensa} pontos por completar esta meta!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetasPessoais;
