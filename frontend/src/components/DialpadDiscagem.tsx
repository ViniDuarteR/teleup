import { useState, useEffect } from "react";
import { Phone, Delete, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DialpadDiscagemProps {
  onIniciarChamada: (numero: string) => void;
  onFinalizarChamada: () => void;
  emChamada: boolean;
  disabled?: boolean;
}

const DialpadDiscagem = ({ 
  onIniciarChamada, 
  onFinalizarChamada, 
  emChamada, 
  disabled = false 
}: DialpadDiscagemProps) => {
  const [numero, setNumero] = useState("");
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  // Teclas do dialpad
  const teclas = [
    { numero: "1", letras: "" },
    { numero: "2", letras: "ABC" },
    { numero: "3", letras: "DEF" },
    { numero: "4", letras: "GHI" },
    { numero: "5", letras: "JKL" },
    { numero: "6", letras: "MNO" },
    { numero: "7", letras: "PQRS" },
    { numero: "8", letras: "TUV" },
    { numero: "9", letras: "WXYZ" },
    { numero: "*", letras: "" },
    { numero: "0", letras: "+" },
    { numero: "#", letras: "" },
  ];

  // Adicionar número
  const adicionarNumero = (num: string) => {
    if (emChamada || disabled) return;
    
    setNumero(prev => prev + num);
    setAnimatingKey(num);
    
    // Som de clique (opcional - pode adicionar depois)
    // playClickSound();
    
    setTimeout(() => setAnimatingKey(null), 150);
  };

  // Remover último dígito
  const removerUltimo = () => {
    if (emChamada || disabled) return;
    setNumero(prev => prev.slice(0, -1));
  };

  // Limpar tudo
  const limpar = () => {
    if (emChamada || disabled) return;
    setNumero("");
  };

  // Iniciar chamada com animação
  const iniciarChamada = () => {
    if (!numero || numero.length < 8 || emChamada || disabled) return;
    
    // Ativar animação de chamada
    setIsCalling(true);
    
    // Simular delay da animação antes de iniciar a chamada real
    setTimeout(() => {
      onIniciarChamada(numero);
      setIsCalling(false);
    }, 1500); // 1.5 segundos de animação
  };

  // Finalizar chamada
  const finalizar = () => {
    onFinalizarChamada();
    setNumero("");
  };

  // Suporte a teclado físico
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (emChamada || disabled) return;

      if (e.key >= "0" && e.key <= "9") {
        adicionarNumero(e.key);
      } else if (e.key === "*" || e.key === "#") {
        adicionarNumero(e.key);
      } else if (e.key === "Backspace") {
        removerUltimo();
      } else if (e.key === "Enter" && numero.length >= 8) {
        iniciarChamada();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [numero, emChamada, disabled]);

  return (
    <Card className={cn(
      "p-6 space-y-4 transition-all duration-300",
      emChamada && "ring-2 ring-success shadow-lg shadow-success/20"
    )}>
      {/* Título do componente */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          📞 Sistema de Discagem
        </h3>
        <p className="text-sm text-muted-foreground">
          Digite o número e clique em "Ligar"
        </p>
      </div>

      {/* Display do número */}
      <div className="min-h-16 flex items-center justify-center">
        <div className="text-center w-full">
          {emChamada ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground animate-pulse">
                Chamada ativa
              </div>
              <div className="text-2xl font-bold text-success">
                {numero || "Sem número"}
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/[^0-9*#]/g, ""))}
                placeholder="Digite o número"
                disabled={disabled}
                className={cn(
                  "w-full text-center text-2xl font-mono font-bold bg-transparent",
                  "border-none outline-none focus:ring-0",
                  "text-foreground placeholder:text-muted-foreground/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                maxLength={15}
              />
              {numero && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpar}
                  disabled={disabled}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <Delete className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid do teclado */}
      <div className="grid grid-cols-3 gap-3">
        {teclas.map((tecla) => (
          <Button
            key={tecla.numero}
            variant="outline"
            size="lg"
            onClick={() => adicionarNumero(tecla.numero)}
            disabled={emChamada || disabled}
            className={cn(
              "h-16 flex flex-col items-center justify-center",
              "hover:bg-primary/10 hover:border-primary transition-all",
              "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              animatingKey === tecla.numero && "scale-95 bg-primary/20 border-primary"
            )}
          >
            <span className="text-2xl font-bold">{tecla.numero}</span>
            {tecla.letras && (
              <span className="text-[10px] text-muted-foreground tracking-wider">
                {tecla.letras}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Botões de ação */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {emChamada ? (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={removerUltimo}
              disabled={disabled}
              className="h-14"
            >
              <Delete className="w-5 h-5 mr-2" />
              Apagar
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={finalizar}
              disabled={disabled}
              className="h-14 btn-gaming bg-destructive hover:bg-destructive/90"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Finalizar
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={removerUltimo}
              disabled={!numero || disabled}
              className="h-14"
            >
              <Delete className="w-5 h-5 mr-2" />
              Apagar
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={iniciarChamada}
              disabled={!numero || numero.length < 8 || disabled || isCalling}
              className={cn(
                "h-14 btn-gaming relative overflow-hidden",
                numero.length >= 8 && !isCalling && "bg-success hover:bg-success/90 pulse-glow",
                isCalling && "bg-primary ring-4 ring-primary/50 ring-animation"
              )}
            >
              {isCalling ? (
                <>
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Ligando...</span>
                  </div>
                  {/* Efeito de ondas */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full animate-ping"></div>
                  </div>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Ligar
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Mensagem de validação */}
      {!emChamada && numero && numero.length < 8 && (
        <div className="text-xs text-warning text-center">
          O número deve ter pelo menos 8 dígitos
        </div>
      )}
    </Card>
  );
};

export default DialpadDiscagem;

