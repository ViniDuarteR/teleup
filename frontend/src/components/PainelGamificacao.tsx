import { type ComponentType, type SVGProps } from "react";
import { Trophy, Target, Zap, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

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

interface PainelGamificacaoProps {
  missoes: Missao[];
  conquistas: Conquista[];
  pontos: number;
}

const PainelGamificacao = ({ missoes, conquistas, pontos }: PainelGamificacaoProps) => {
  const navigate = useNavigate();
  
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
      phone: Target,
      zap: Zap,
      star: Trophy,
    };
    return iconMap[iconName] || Trophy;
  };

  const missaoAtiva = missoes.find(m => m.tipo === "diaria") || missoes[0];

  return (
    <div className="space-y-6">
      {/* Saldo de pontos */}
      <div className="gaming-card-glow p-6 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-xp" />
          <span className="text-sm text-muted-foreground">Pontos Disponíveis</span>
        </div>
        <div className="text-3xl font-bold text-xp text-glow">
          {pontos || 0}
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="mt-3 btn-secondary-gaming"
          onClick={() => navigate('/loja')}
        >
          <Gift className="w-4 h-4 mr-2" />
          Ver Loja
        </Button>
      </div>

      {/* Missão Diária */}
      {missaoAtiva && (
        <div className="gaming-card p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Missão {missaoAtiva.tipo === 'diaria' ? 'Diária' : 'Semanal'}</h3>
            <Badge variant="secondary" className="ml-auto">
              +{missaoAtiva.pontos_recompensa} pts
            </Badge>
          </div>

          <h4 className="font-medium text-foreground mb-2">
            {missaoAtiva.titulo}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {missaoAtiva.descricao}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">
                {missaoAtiva.progresso} / {missaoAtiva.meta}
              </span>
              <span className="text-muted-foreground">
                {missaoAtiva.meta > 0 ? Math.round((missaoAtiva.progresso / missaoAtiva.meta) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full progress-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    missaoAtiva.meta > 0 ? (missaoAtiva.progresso / missaoAtiva.meta) * 100 : 0,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Últimas Conquistas */}
      <div className="gaming-card p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-xp" />
            <h3 className="font-semibold text-foreground">Conquistas Recentes</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            Ver Todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-3">
          {conquistas.map((conquista) => {
            const Icon = getIcon(conquista.icone);
            return (
              <div key={conquista.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-xp/20 rounded-full">
                  <Icon className="w-4 h-4 text-xp" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">
                    {conquista.titulo}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {conquista.data ? new Date(conquista.data).toLocaleDateString('pt-BR') : 'Não desbloqueada'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call-to-Action */}
      <div className="gaming-card p-6 rounded-lg text-center">
        <h3 className="font-semibold text-foreground mb-2">Próxima Meta</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete mais 22 chamadas para desbloquear o título "Operador Elite"
        </p>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full xp-bar w-3/4 transition-all duration-500" />
        </div>
        <p className="text-xs text-muted-foreground">78% completo</p>
      </div>
    </div>
  );
};

export default PainelGamificacao;
