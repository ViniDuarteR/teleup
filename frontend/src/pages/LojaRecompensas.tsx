import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/useAuth";
import Header from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "../lib/api";
import { 
  Store, 
  Gift, 
  Star, 
  ShoppingCart, 
  Coins, 
  Trophy,
  Clock,
  Zap,
  Crown,
  Heart,
  Shield,
  Sparkles,
  Search,
  Filter,
  SortAsc
} from "lucide-react";
import { toast } from "sonner";

interface Recompensa {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  tipo: 'item' | 'beneficio' | 'titulo' | 'avatar';
  raridade: 'comum' | 'raro' | 'epico' | 'lendario';
  imagem: string;
  disponivel: boolean;
  quantidade_restante?: number;
}

interface Compra {
  id: number;
  recompensa_id: number;
  operador_id: number;
  data_compra: string;
  status: 'pendente' | 'aprovada' | 'entregue';
}

const LojaRecompensas = () => {
  const { user, token } = useAuth();
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('todas');
  const [busca, setBusca] = useState<string>('');
  const [ordenacao, setOrdenacao] = useState<string>('preco');


  // Buscar recompensas disponíveis
  const buscarRecompensas = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/recompensas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setRecompensas(data.data);
      }

    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      toast.error('Erro ao carregar recompensas');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Buscar compras do operador
  const buscarCompras = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/recompensas/compras`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setCompras(data.data);
      }

    } catch (error) {
      console.error('Erro ao buscar compras:', error);
    }
  }, [token]);

  // Comprar recompensa
  const comprarRecompensa = async (recompensaId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/recompensas/comprar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recompensa_id: recompensaId })
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Compra realizada! Você gastou ${data.data.pontos_gastos} pontos! 🎉`);
        buscarRecompensas();
        buscarCompras();
      } else {
        toast.error(data.message || 'Erro ao comprar recompensa');
      }

    } catch (error) {
      console.error('Erro ao comprar recompensa:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    buscarRecompensas();
    buscarCompras();
  }, [token, buscarRecompensas, buscarCompras]);

  const getIconeCategoria = (categoria: string) => {
    switch (categoria) {
      case 'Itens':
        return <Gift className="w-4 h-4" />;
      case 'Benefícios':
        return <Zap className="w-4 h-4" />;
      case 'Títulos':
        return <Crown className="w-4 h-4" />;
      case 'Avatares':
        return <Heart className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getCorRaridade = (raridade: string) => {
    switch (raridade) {
      case 'comum':
        return 'bg-gray-500 text-white';
      case 'raro':
        return 'bg-blue-500 text-white';
      case 'epico':
        return 'bg-purple-500 text-white';
      case 'lendario':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'item':
        return <Gift className="w-4 h-4" />;
      case 'beneficio':
        return <Zap className="w-4 h-4" />;
      case 'titulo':
        return <Crown className="w-4 h-4" />;
      case 'avatar':
        return <Heart className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  // Filtrar e ordenar recompensas
  const recompensasFiltradas = recompensas
    .filter(recompensa => {
      const matchFiltro = filtro === 'todas' || recompensa.categoria === filtro;
      const matchBusca = busca === '' || 
        recompensa.nome.toLowerCase().includes(busca.toLowerCase()) ||
        recompensa.descricao.toLowerCase().includes(busca.toLowerCase());
      return matchFiltro && matchBusca && recompensa.disponivel;
    })
    .sort((a, b) => {
      switch (ordenacao) {
        case 'preco':
          return a.preco - b.preco;
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'raridade': {
          const ordemRaridade = { 'comum': 1, 'raro': 2, 'epico': 3, 'lendario': 4 };
          return ordemRaridade[a.raridade] - ordemRaridade[b.raridade];
        }
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando loja...</p>
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

  // Adaptador para garantir que todas as propriedades necessárias estejam presentes
  const operadorData = {
    nome: user.nome || 'Usuário',
    avatar: user.avatar || '/placeholder.svg',
    nivel: user.nivel || 1,
    xp_atual: user.xp_atual || 0,
    xp_proximo_nivel: user.xp_proximo_nivel || 100,
    pontos_totais: user.pontos_totais || 0,
    tempo_online: user.tempo_online || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Header operador={operadorData} />
      
      <div className="p-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header da Loja */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Store className="w-8 h-8 text-primary" />
                Loja de Recompensas
              </h1>
              <p className="text-muted-foreground">Troque seus pontos por recompensas incríveis!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Seus Pontos</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  {user.pontos_totais?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar recompensas..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="todas">Todas as Categorias</option>
                    <option value="Itens">Itens</option>
                    <option value="Benefícios">Benefícios</option>
                    <option value="Títulos">Títulos</option>
                    <option value="Avatares">Avatares</option>
                  </select>
                  
                  <select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="preco">Preço</option>
                    <option value="nome">Nome</option>
                    <option value="raridade">Raridade</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Recompensas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recompensasFiltradas.length === 0 ? (
              <div className="col-span-full">
                <Card className="gaming-card">
                  <CardContent className="p-8 text-center">
                    <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma recompensa encontrada</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou aguarde novas recompensas!
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              recompensasFiltradas.map((recompensa) => {
                const podeComprar = user.pontos_totais >= recompensa.preco;
                const jaComprou = compras.some(compra => 
                  compra.recompensa_id === recompensa.id && 
                  compra.status !== 'pendente'
                );

                return (
                  <Card key={recompensa.id} className={`gaming-card transition-all duration-300 hover:scale-105 ${
                    jaComprou ? 'ring-2 ring-success' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`${getCorRaridade(recompensa.raridade)} capitalize`}>
                          {recompensa.raridade}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getIconeTipo(recompensa.tipo)}
                          <span className="text-xs">{recompensa.categoria}</span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg">{recompensa.nome}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-4xl">
                          {getIconeCategoria(recompensa.categoria)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recompensa.descricao}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className="font-bold text-primary">
                            {recompensa.preco?.toLocaleString() || '0'}
                          </span>
                        </div>
                        
                        {recompensa.quantidade_restante && (
                          <Badge variant="outline" className="text-xs">
                            {recompensa.quantidade_restante} restantes
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        className={`w-full ${
                          jaComprou 
                            ? 'bg-success hover:bg-success/90' 
                            : podeComprar 
                              ? 'btn-gaming' 
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                        onClick={() => comprarRecompensa(recompensa.id)}
                        disabled={!podeComprar || jaComprou}
                      >
                        {jaComprou ? (
                          <>
                            <Trophy className="w-4 h-4 mr-2" />
                            Adquirido
                          </>
                        ) : podeComprar ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Comprar
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            Pontos Insuficientes
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Seção de Compras Recentes */}
          {compras.length > 0 && (
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Suas Compras Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {compras.slice(0, 5).map((compra) => {
                    const recompensa = recompensas.find(r => r.id === compra.recompensa_id);
                    return (
                      <div key={compra.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            {recompensa && getIconeCategoria(recompensa.categoria)}
                          </div>
                          <div>
                            <div className="font-semibold">{recompensa?.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(compra.data_compra).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={compra.status === 'entregue' ? 'default' : 'secondary'}>
                          {compra.status === 'entregue' ? 'Entregue' : 'Pendente'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LojaRecompensas;
