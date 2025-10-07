import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../components/Header";
import GridMetas from "../components/GridMetas";
import SistemaDiscagem from "../components/SistemaDiscagem";
import PainelGamificacao from "../components/PainelGamificacao";
import { toast } from "sonner";

interface Meta {
  id: number;
  tipo: string;
  valor_meta: number;
  valor_atual: number;
  periodo: string;
  concluida: boolean;
  pontos_recompensa: number;
}

interface Missao {
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

interface Conquista {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  categoria: string;
  pontos_recompensa: number;
}

const DashboardOperador = () => {
  const { user, token } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Buscar dados do dashboard
  const buscarDadosDashboard = async () => {
    if (!token) {
      console.log('DashboardOperador - No token available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('DashboardOperador - Fetching dashboard data...');

      // Buscar metas
      try {
        const metasResponse = await fetch(`${API_BASE_URL}/gamificacao/metas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const metasData = await metasResponse.json();
        console.log('DashboardOperador - Metas response:', metasData);
        if (metasData.success) {
          setMetas(metasData.data);
        }
      } catch (error) {
        console.error('DashboardOperador - Error fetching metas:', error);
      }

      // Buscar missões
      try {
        const missoesResponse = await fetch(`${API_BASE_URL}/gamificacao/missoes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const missoesData = await missoesResponse.json();
        console.log('DashboardOperador - Missoes response:', missoesData);
        if (missoesData.success) {
          setMissoes(missoesData.data);
        }
      } catch (error) {
        console.error('DashboardOperador - Error fetching missoes:', error);
      }

      // Buscar conquistas
      try {
        const conquistasResponse = await fetch(`${API_BASE_URL}/gamificacao/conquistas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const conquistasData = await conquistasResponse.json();
        console.log('DashboardOperador - Conquistas response:', conquistasData);
        if (conquistasData.success) {
          setConquistas(conquistasData.data.slice(0, 3));
        }
      } catch (error) {
        console.error('DashboardOperador - Error fetching conquistas:', error);
      }

    } catch (error) {
      console.error('DashboardOperador - General error:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosDashboard();
  }, [token]);

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
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <Header operador={user} />
      
      {/* Layout principal */}
      <div className="flex gap-6 p-6 pt-24">
        {/* Conteúdo principal */}
        <div className="flex-1 space-y-6">
          {/* Grid de metas */}
          <GridMetas metas={metas} />
          
          {/* Sistema de discagem */}
          <SistemaDiscagem />
        </div>
        
        {/* Painel lateral de gamificação */}
        <div className="w-80">
          <PainelGamificacao 
            missoes={missoes} 
            conquistas={conquistas}
            pontos={user.pontos_totais}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOperador;