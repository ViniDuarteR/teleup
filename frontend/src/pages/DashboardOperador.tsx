import { useEffect, useState } from "react";
import Header from "../components/Header";
import GridMetas from "../components/GridMetas";
import FilaInteligente from "../components/FilaInteligente";
import PainelGamificacao from "../components/PainelGamificacao";

// Import mock data
import operadorData from "../data/operador.json";
import metasData from "../data/metas.json";
import missoesData from "../data/missoes.json";
import conquistasData from "../data/conquistas.json";

const DashboardOperador = () => {
  const [operador] = useState(operadorData);
  const [metas] = useState(metasData);
  const [missoes] = useState(missoesData);
  const [conquistas] = useState(conquistasData.filter(c => c.desbloqueada).slice(0, 3));

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <Header operador={operador} />
      
      {/* Layout principal */}
      <div className="flex gap-6 p-6 pt-24">
        {/* Conteúdo principal */}
        <div className="flex-1 space-y-6">
          {/* Grid de metas */}
          <GridMetas metas={metas} />
          
          {/* Fila inteligente */}
          <FilaInteligente status={operador.status} />
        </div>
        
        {/* Painel lateral de gamificação */}
        <div className="w-80">
          <PainelGamificacao 
            missoes={missoes} 
            conquistas={conquistas}
            pontos={operador.pontos_totais}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOperador;