import { useState, useEffect } from "react";
import { Phone, User, Clock, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModalChamadaAtivaProps {
  aberto: boolean;
  numeroChamada: string;
  tipoChamada: "Entrada" | "Saída";
  onFechar?: () => void;
}

const ModalChamadaAtiva = ({ 
  aberto, 
  numeroChamada, 
  tipoChamada,
  onFechar 
}: ModalChamadaAtivaProps) => {
  const [duracao, setDuracao] = useState(0);
  const [pulso, setPulso] = useState(true);

  // Timer da chamada
  useEffect(() => {
    if (!aberto) {
      setDuracao(0);
      return;
    }

    const interval = setInterval(() => {
      setDuracao(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [aberto]);

  // Efeito de pulso
  useEffect(() => {
    const pulsoInterval = setInterval(() => {
      setPulso(prev => !prev);
    }, 1000);

    return () => clearInterval(pulsoInterval);
  }, []);

  // Formatar duração
  const formatarDuracao = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  // Formatar número de telefone
  const formatarNumero = (numero: string) => {
    // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    } else if (numero.length === 10) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
    }
    return numero;
  };

  // Determinar cor baseado na duração
  const getCorDuracao = () => {
    if (duracao < 180) return "text-success"; // < 3 min
    if (duracao < 300) return "text-warning"; // < 5 min
    return "text-destructive"; // > 5 min
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className={cn(
              "w-5 h-5 text-success transition-opacity",
              pulso ? "opacity-100" : "opacity-50"
            )} />
            Chamada em Andamento
          </DialogTitle>
          <DialogDescription>
            Atendimento ativo no momento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badge do tipo de chamada */}
          <div className="flex justify-center">
            <Badge 
              variant={tipoChamada === "Entrada" ? "default" : "secondary"}
              className="text-sm px-4 py-1"
            >
              {tipoChamada === "Entrada" ? "📞 Chamada Recebida" : "📱 Chamada Realizada"}
            </Badge>
          </div>

          {/* Ícone central animado */}
          <div className="flex justify-center">
            <div className={cn(
              "relative w-24 h-24 rounded-full bg-success/20 flex items-center justify-center",
              pulso && "pulse-glow"
            )}>
              <Phone className="w-12 h-12 text-success" />
              
              {/* Anéis de pulso */}
              <div className="absolute inset-0 rounded-full border-2 border-success/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-success/20 animate-pulse" />
            </div>
          </div>

          {/* Número do cliente */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <User className="w-4 h-4" />
              <span>Número do Cliente</span>
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">
              {formatarNumero(numeroChamada)}
            </div>
          </div>

          {/* Timer da chamada */}
          <div className="bg-muted/50 rounded-lg p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>Duração da Chamada</span>
            </div>
            <div className={cn(
              "text-5xl font-bold font-mono transition-colors",
              getCorDuracao()
            )}>
              {formatarDuracao(duracao)}
            </div>
          </div>

          {/* Estatísticas da chamada */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {Math.floor(duracao / 60)}
              </div>
              <div className="text-xs text-muted-foreground">Minutos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {duracao % 60}
              </div>
              <div className="text-xs text-muted-foreground">Segundos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">Ativa</div>
              <div className="text-xs text-muted-foreground">Status</div>
            </div>
          </div>

          {/* Dica */}
          <div className="text-xs text-center text-muted-foreground bg-primary/5 rounded-lg p-3 border border-primary/20">
            💡 Use o botão "Finalizar" no discador para encerrar a chamada e registrar o atendimento
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalChamadaAtiva;

