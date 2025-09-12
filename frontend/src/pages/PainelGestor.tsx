import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MetricasGeraisEquipe from "@/components/gestor/MetricasGeraisEquipe";
import RankingOperadores from "@/components/gestor/RankingOperadores";
import FerramentaDeGamificacao from "@/components/gestor/FerramentaDeGamificacao";
import TabelaDesempenhoDetalhada from "@/components/gestor/TabelaDesempenhoDetalhada";
import dadosGestor from "@/data/dadosGestor.json";
import operadorData from "@/data/operador.json";

const PainelGestor = () => {
  const [dados, setDados] = useState(dadosGestor);

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setDados(prev => ({
        ...prev,
        metricas: {
          ...prev.metricas,
          chamadasAndamento: Math.floor(Math.random() * 20) + 5,
          eficienciaDiscador: Math.round((Math.random() * 20 + 75) * 10) / 10,
          nivelOciosidade: Math.round((Math.random() * 25 + 10) * 10) / 10
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header operador={operadorData} />
      
      <div className="pt-24 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Cabeçalho da Página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary text-glow mb-2">
              Painel do Gestor
            </h1>
            <p className="text-muted-foreground">
              Dashboard executivo para monitoramento e gestão da equipe
            </p>
          </div>

          {/* Métricas Principais */}
          <MetricasGeraisEquipe metricas={dados.metricas} />

          {/* Rankings e Gamificação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RankingOperadores operadores={dados.operadores} />
            <FerramentaDeGamificacao 
              operadores={dados.operadores.map(op => ({ id: op.id, nome: op.nome }))}
              missoesAtivas={dados.missoesAtivas}
            />
          </div>

          {/* Tabela Detalhada */}
          <TabelaDesempenhoDetalhada operadores={dados.operadores} />
        </div>
      </div>
    </div>
  );
};

export default PainelGestor;