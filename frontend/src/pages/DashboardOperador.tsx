import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/useAuth";
import Header from "../components/Header";
import GridMetas from "../components/GridMetas";
import SistemaDiscagem from "../components/SistemaDiscagem";
import PainelGamificacao from "../components/PainelGamificacao";
import { toast } from "sonner";
import { API_BASE_URL } from "../lib/api";

interface Meta {
  id: number;
  titulo: string;
  atual: number;
  meta: number;
  icone: string;
  cor: string;
  formato?: string;
}

interface Missao {
  id: number;
  titulo: string;
  descricao: string;
  progresso: number;
  meta: number;
  pontos_recompensa: number;
  tipo: string;
}

interface Conquista {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
  data: string | null;
}

// Interfaces para dados da API
interface MetaAPI {
  id: number;
  tipo: string;
  valor_meta: number;
  valor_atual: number;
  periodo: string;
  concluida: boolean;
  pontos_recompensa: number;
}

interface MissaoAPI {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  objetivo: number;
  progresso_atual: number;
  concluida: boolean;
  recompensa_pontos: number;
  recompensa_xp: number;
}

interface ConquistaAPI {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  categoria: string;
  pontos_recompensa: number;
}

interface EstatisticasDashboard {
  chamadas_hoje?: number;
  tempo_total?: number;
  satisfacao_media?: number;
  resolucoes?: number;
}

const DashboardOperador = () => {
  const { user, token, updateUser } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pontosOperador, setPontosOperador] = useState(user?.pontos_totais ?? 0);
  const pontosRef = useRef(user?.pontos_totais ?? 0);
  const tempoRef = useRef(user?.tempo_online ?? 0);

  useEffect(() => {
    if (typeof user?.pontos_totais === "number") {
      pontosRef.current = user.pontos_totais;
    }
    if (typeof user?.tempo_online === "number") {
      tempoRef.current = user.tempo_online;
    }
  }, [user?.pontos_totais, user?.tempo_online]);


  // Buscar dados do dashboard
  const buscarDadosDashboard = useCallback(async (mostrarLoading = true) => {
    if (!token) {
      console.log('DashboardOperador - No token available');
      if (mostrarLoading) {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (mostrarLoading) {
        setIsLoading(true);
      }
      console.log('DashboardOperador - Fetching dashboard data...');

      const metasCalculadas: Meta[] = [];
      let missoesCarregadas = false;
      let conquistasCarregadas = false;
      let estatisticasDashboard: EstatisticasDashboard | undefined;
      let operadorInfo: { tempo_online?: number; pontos_totais?: number } | undefined;

      try {
        const dashboardResponse = await fetch(`${API_BASE_URL}/api/operador/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const dashboardData = await dashboardResponse.json();

        if (dashboardData.success && dashboardData.data) {
          const { operador, metas: metasApi, missoes: missoesApi, conquistas: conquistasApi, estatisticas } = dashboardData.data as {
            operador?: { tempo_online?: number; pontos_totais?: number };
            metas?: MetaAPI[];
            missoes?: MissaoAPI[];
            conquistas?: ConquistaAPI[];
            estatisticas?: EstatisticasDashboard;
          };

          estatisticasDashboard = estatisticas;

          if (operador) {
            operadorInfo = operador;
            const pontosAtualizados = operador.pontos_totais ?? pontosRef.current;
            const tempoAtualizado = operador.tempo_online ?? tempoRef.current;

            setPontosOperador(pontosAtualizados);

            if (
              user &&
              updateUser &&
              (pontosRef.current !== pontosAtualizados || tempoRef.current !== tempoAtualizado)
            ) {
              pontosRef.current = pontosAtualizados;
              tempoRef.current = tempoAtualizado;
              updateUser({ ...user, ...operador });
            }
          }

          if (Array.isArray(metasApi) && metasApi.length > 0) {
            metasApi.forEach((metaApi, index) => {
              const tipoLower = (metaApi.tipo || '').toLowerCase();
              const isTempo = tipoLower.includes('tempo');

              metasCalculadas.push({
                id: typeof metaApi.id === 'number' ? metaApi.id : index + 1,
                titulo: metaApi.tipo || `Meta ${index + 1}`,
                atual: metaApi.valor_atual ?? 0,
                meta: metaApi.valor_meta ?? 0,
                icone: isTempo ? 'clock' : 'phone',
                cor: isTempo ? 'success' : 'primary',
                formato: isTempo ? 'minutos' : undefined,
              });
            });
          } else {
            const chamadasHoje = estatisticasDashboard?.chamadas_hoje ?? 0;
            const tempoOnlineMinutos = operadorInfo?.tempo_online ?? tempoRef.current ?? 0;
            metasCalculadas.push(
              {
                id: 1,
                titulo: 'Chamadas Atendidas',
                atual: chamadasHoje,
                meta: 20,
                icone: 'phone',
                cor: 'primary',
              },
              {
                id: 2,
                titulo: 'Tempo Online',
                atual: tempoOnlineMinutos,
                meta: 480,
                icone: 'clock',
                cor: 'success',
                formato: 'minutos',
              },
            );
          }

          if (Array.isArray(missoesApi) && missoesApi.length > 0) {
            const missoesMapeadas = missoesApi.map((missao: MissaoAPI) => ({
              id: missao.id,
              titulo: missao.titulo,
              descricao: missao.descricao,
              progresso: missao.progresso_atual || 0,
              meta: missao.objetivo || 0,
              pontos_recompensa: missao.recompensa_pontos || 0,
              tipo: missao.tipo || 'diaria',
            }));
            setMissoes(missoesMapeadas);
            missoesCarregadas = true;
          }

          if (Array.isArray(conquistasApi) && conquistasApi.length > 0) {
            const conquistasMapeadas = conquistasApi.slice(0, 3).map((conquista: ConquistaAPI) => ({
              id: conquista.id,
              titulo: conquista.nome,
              descricao: conquista.descricao,
              icone: 'star',
              desbloqueada: true,
              data: new Date().toISOString(),
            }));
            setConquistas(conquistasMapeadas);
            conquistasCarregadas = true;
          }
        }
      } catch (error) {
        console.error('DashboardOperador - Error fetching operador dashboard:', error);
      }

      if (metasCalculadas.length === 0) {
        const chamadasHojeFallback = estatisticasDashboard?.chamadas_hoje ?? 0;
        const tempoOnlineFallback = operadorInfo?.tempo_online ?? tempoRef.current ?? 0;
        metasCalculadas.push(
          {
            id: 1,
            titulo: 'Chamadas Atendidas',
            atual: chamadasHojeFallback,
            meta: 20,
            icone: 'phone',
            cor: 'primary',
          },
          {
            id: 2,
            titulo: 'Tempo Online',
            atual: tempoOnlineFallback,
            meta: 480,
            icone: 'clock',
            cor: 'success',
            formato: 'minutos',
          },
        );
      }

      setMetas(metasCalculadas);

      // Buscar missões caso o dashboard não tenha retornado
      if (!missoesCarregadas) {
        try {
          const missoesResponse = await fetch(`${API_BASE_URL}/api/gamificacao/missoes`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const missoesData = await missoesResponse.json();
          console.log('DashboardOperador - Missoes response:', missoesData);
          if (missoesData.success) {
            const missoesMapeadas = missoesData.data.map((missao: MissaoAPI) => ({
              id: missao.id,
              titulo: missao.titulo,
              descricao: missao.descricao,
              progresso: missao.progresso_atual || 0,
              meta: missao.objetivo || 0,
              pontos_recompensa: missao.recompensa_pontos || 0,
              tipo: missao.tipo || 'diaria'
            }));
            setMissoes(missoesMapeadas);
          }
        } catch (error) {
          console.error('DashboardOperador - Error fetching missoes:', error);
        }
      }

      // Buscar conquistas caso o dashboard não tenha retornado
      if (!conquistasCarregadas) {
        try {
          const conquistasResponse = await fetch(`${API_BASE_URL}/api/gamificacao/conquistas`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const conquistasData = await conquistasResponse.json();
          console.log('DashboardOperador - Conquistas response:', conquistasData);
          if (conquistasData.success) {
            const conquistasMapeadas = conquistasData.data.slice(0, 3).map((conquista: ConquistaAPI) => ({
              id: conquista.id,
              titulo: conquista.nome,
              descricao: conquista.descricao,
              icone: 'star',
              desbloqueada: true,
              data: new Date().toISOString()
            }));
            setConquistas(conquistasMapeadas);
          }
        } catch (error) {
          console.error('DashboardOperador - Error fetching conquistas:', error);
        }
      }

    } catch (error) {
      console.error('DashboardOperador - General error:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      if (mostrarLoading) {
        setIsLoading(false);
      }
    }
  }, [token, updateUser, user]);

  useEffect(() => {
    buscarDadosDashboard();
  }, [token, buscarDadosDashboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header operador={user} />

      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8 pt-4 lg:pt-6">
        <div className="w-full max-w-[1600px]">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 lg:gap-6">
            <div className="flex flex-col space-y-4 lg:space-y-6 min-w-0">
              <div className="w-full">
                <GridMetas metas={metas} />
              </div>
              <div className="w-full flex-1 min-h-0">
                <SistemaDiscagem onAtualizarDashboard={() => buscarDadosDashboard(false)} />
              </div>
            </div>

            <aside className="flex flex-col space-y-4 lg:space-y-6 min-w-0">
              <PainelGamificacao
                missoes={missoes}
                conquistas={conquistas}
                pontos={pontosOperador}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOperador;
