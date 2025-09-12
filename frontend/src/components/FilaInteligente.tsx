import { Phone, PhoneCall, Coffee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilaInteligenteProps {
  status: string;
}

const FilaInteligente = ({ status }: FilaInteligenteProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Em Chamada":
        return {
          icon: PhoneCall,
          titulo: "Em Atendimento",
          descricao: "Chamada ativa no momento",
          cor: "success",
          pulso: false,
          botaoTexto: "Finalizar Chamada",
          botaoVariant: "destructive" as const
        };
      case "Em Pausa":
        return {
          icon: Coffee,
          titulo: "Em Pausa",
          descricao: "Operador temporariamente indisponível",
          cor: "warning",
          pulso: false,
          botaoTexto: "Voltar ao Atendimento",
          botaoVariant: "default" as const
        };
      default: // "Aguardando Chamada"
        return {
          icon: Phone,
          titulo: "Aguardando Chamada",
          descricao: "Pronto para receber próxima chamada",
          cor: "primary",
          pulso: true,
          botaoTexto: "Entrar em Pausa",
          botaoVariant: "secondary" as const
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="gaming-card p-8 rounded-lg text-center">
      <div className="space-y-6">
        {/* Ícone principal */}
        <div className={`mx-auto w-24 h-24 rounded-full bg-${config.cor}/20 flex items-center justify-center ${config.pulso ? 'pulse-glow' : ''}`}>
          <Icon className={`w-12 h-12 text-${config.cor}`} />
        </div>

        {/* Título e descrição */}
        <div>
          <h2 className={`text-3xl font-bold text-${config.cor} text-glow mb-2`}>
            {config.titulo}
          </h2>
          <p className="text-muted-foreground text-lg">
            {config.descricao}
          </p>
        </div>

        {/* Informações adicionais baseadas no status */}
        {status === "Aguardando Chamada" && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Próxima chamada em aproximadamente 2 min</span>
            </div>
          </div>
        )}

        {status === "Em Chamada" && (
          <div className="bg-success/10 rounded-lg p-4">
            <div className="text-success">
              <div className="text-2xl font-bold">05:23</div>
              <div className="text-sm">Tempo de conversa atual</div>
            </div>
          </div>
        )}

        {/* Botão de ação */}
        <Button 
          variant={config.botaoVariant}
          size="lg"
          className="w-full max-w-xs btn-gaming"
        >
          {config.botaoTexto}
        </Button>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">47</div>
            <div className="text-xs text-muted-foreground">Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">3:45</div>
            <div className="text-xs text-muted-foreground">Média</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">92%</div>
            <div className="text-xs text-muted-foreground">Satisfação</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilaInteligente;