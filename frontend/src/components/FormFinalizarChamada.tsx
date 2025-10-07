import { useState } from "react";
import { Star, CheckCircle2, XCircle, MessageSquare, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FormFinalizarChamadaProps {
  aberto: boolean;
  chamadaId: number | null;
  numeroChamada: string;
  duracao: number;
  onFinalizar: (dados: DadosFinalizacao) => Promise<void>;
  onCancelar: () => void;
}

export interface DadosFinalizacao {
  chamada_id: number;
  satisfacao_cliente: number;
  resolvida: boolean;
  observacoes: string;
}

const FormFinalizarChamada = ({ 
  aberto, 
  chamadaId,
  numeroChamada, 
  duracao,
  onFinalizar,
  onCancelar 
}: FormFinalizarChamadaProps) => {
  const [satisfacao, setSatisfacao] = useState<number>(0);
  const [resolvida, setResolvida] = useState<string>("sim");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  // Formatar duração
  const formatarDuracao = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}min ${segs}s`;
  };

  // Resetar formulário
  const resetarForm = () => {
    setSatisfacao(0);
    setResolvida("sim");
    setObservacoes("");
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (satisfacao === 0) {
      toast.error("Por favor, avalie a satisfação do cliente");
      return;
    }

    if (!chamadaId) {
      toast.error("ID da chamada não encontrado");
      return;
    }

    setLoading(true);

    try {
      await onFinalizar({
        chamada_id: chamadaId,
        satisfacao_cliente: satisfacao,
        resolvida: resolvida === "sim",
        observacoes: observacoes.trim()
      });

      // Resetar e fechar
      resetarForm();
      toast.success("Chamada finalizada com sucesso! 🎉");
    } catch (error) {
      toast.error("Erro ao finalizar chamada");
    } finally {
      setLoading(false);
    }
  };

  // Cancelar
  const handleCancelar = () => {
    resetarForm();
    onCancelar();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleCancelar}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Finalizar Atendimento
          </DialogTitle>
          <DialogDescription>
            Registre os detalhes do atendimento para ganhar pontos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da chamada */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Número:</span>
              <span className="font-mono font-semibold">{numeroChamada}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-semibold">{formatarDuracao(duracao)}</span>
            </div>
          </div>

          {/* Satisfação do Cliente */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Como foi a satisfação do cliente? *
            </Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setSatisfacao(estrela)}
                  disabled={loading}
                  className={cn(
                    "transition-all duration-200 hover:scale-110 active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      estrela <= satisfacao
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    )}
                  />
                </button>
              ))}
            </div>
            {satisfacao > 0 && (
              <div className="text-center">
                <span className={cn(
                  "text-sm font-medium",
                  satisfacao >= 4 ? "text-success" : satisfacao >= 3 ? "text-warning" : "text-destructive"
                )}>
                  {satisfacao === 5 && "⭐ Excelente!"}
                  {satisfacao === 4 && "😊 Muito Bom!"}
                  {satisfacao === 3 && "😐 Bom"}
                  {satisfacao === 2 && "😕 Regular"}
                  {satisfacao === 1 && "😞 Precisa Melhorar"}
                </span>
              </div>
            )}
          </div>

          {/* Problema Resolvido */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              O problema foi resolvido? *
            </Label>
            <RadioGroup value={resolvida} onValueChange={setResolvida}>
              <div className="grid grid-cols-2 gap-4">
                <label
                  htmlFor="resolvida-sim"
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    resolvida === "sim"
                      ? "border-success bg-success/10"
                      : "border-border hover:border-success/50"
                  )}
                >
                  <RadioGroupItem value="sim" id="resolvida-sim" />
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-medium">Sim</span>
                  </div>
                </label>

                <label
                  htmlFor="resolvida-nao"
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    resolvida === "nao"
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  )}
                >
                  <RadioGroupItem value="nao" id="resolvida-nao" />
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-medium">Não</span>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Observações */}
          <div className="space-y-3">
            <Label htmlFor="observacoes" className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione detalhes sobre o atendimento, problemas encontrados, ou informações relevantes..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={loading}
              className="min-h-24 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {observacoes.length}/500 caracteres
            </div>
          </div>

          {/* Preview de pontos */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">Pontos estimados:</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                +{10 + (resolvida === "sim" ? 20 : 0) + (satisfacao >= 4 ? 15 : 0) + (satisfacao === 5 ? 10 : 0)} XP
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div>• Base: +10 XP</div>
              {resolvida === "sim" && <div>• Problema resolvido: +20 XP</div>}
              {satisfacao >= 4 && <div>• Alta satisfação: +15 XP</div>}
              {satisfacao === 5 && <div>• Satisfação máxima: +10 XP (bônus)</div>}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancelar}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || satisfacao === 0}
            className="btn-gaming"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finalizar Atendimento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormFinalizarChamada;

