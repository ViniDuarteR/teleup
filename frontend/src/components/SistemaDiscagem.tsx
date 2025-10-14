import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import DialpadDiscagem from "./DialpadDiscagem";
import ModalChamadaAtiva from "./ModalChamadaAtiva";
import FormFinalizarChamada, { DadosFinalizacao } from "./FormFinalizarChamada";
import { API_BASE_URL } from "../lib/api";

interface ChamadaAtiva {
  id: number;
  numero: string;
  tipo: "Entrada" | "Saída";
  inicio: Date;
}

const SistemaDiscagem = () => {
  const { token, user, updateUser } = useAuth();
  const [chamadaAtiva, setChamadaAtiva] = useState<ChamadaAtiva | null>(null);
  const [duracaoChamada, setDuracaoChamada] = useState(0);
  const [mostrarModalAtiva, setMostrarModalAtiva] = useState(false);
  const [mostrarFormFinalizar, setMostrarFormFinalizar] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  
  const emChamada = chamadaAtiva !== null;

  // Timer da chamada
  useEffect(() => {
    if (!chamadaAtiva) {
      setDuracaoChamada(0);
      return;
    }

    const interval = setInterval(() => {
      const agora = new Date();
      const diff = Math.floor((agora.getTime() - chamadaAtiva.inicio.getTime()) / 1000);
      setDuracaoChamada(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [chamadaAtiva]);

  // Iniciar chamada
  const iniciarChamada = async (numero: string) => {
    if (!token) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    try {
      toast.loading("Iniciando chamada...", { id: "iniciando-chamada" });

      const response = await fetch(`${API_BASE_URL}/api/chamadas/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero_cliente: numero,
          tipo_chamada: "Saída"
        })
      });

      const data = await response.json();

      if (data.success) {
        setChamadaAtiva({
          id: data.data.chamada_id,
          numero: numero,
          tipo: "Saída",
          inicio: new Date()
        });
        
        setMostrarModalAtiva(true);
        
        // Atualizar status do usuário
        if (updateUser && user) {
          updateUser({ ...user, status: 'Em Chamada' });
        }

        toast.success("Chamada iniciada! 📞", { id: "iniciando-chamada" });
      } else {
        toast.error(data.message || "Erro ao iniciar chamada", { id: "iniciando-chamada" });
      }
    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      toast.error("Erro ao conectar com o servidor", { id: "iniciando-chamada" });
    }
  };

  // Preparar para finalizar chamada
  const prepararFinalizacao = () => {
    setMostrarModalAtiva(false);
    setMostrarFormFinalizar(true);
  };

  // Finalizar chamada
  const finalizarChamada = async (dados: DadosFinalizacao) => {
    if (!token || !chamadaAtiva) return;

    try {
      setFinalizando(true);

      const response = await fetch(`${API_BASE_URL}/api/chamadas/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      const data = await response.json();

      if (data.success) {
        // Mostrar pontos ganhos
        toast.success(
          `Chamada finalizada! +${data.data.pontos_ganhos} pontos ganhos! 🎉`,
          { duration: 5000 }
        );

        // Resetar estado
        setChamadaAtiva(null);
        setMostrarFormFinalizar(false);
        setDuracaoChamada(0);

        // Atualizar status do usuário
        if (updateUser && user) {
          updateUser({ 
            ...user, 
            status: 'Aguardando Chamada',
            pontos_totais: user.pontos_totais + data.data.pontos_ganhos
          });
        }

        // Verificar conquistas
        verificarConquistas();
      } else {
        toast.error(data.message || "Erro ao finalizar chamada");
      }
    } catch (error) {
      console.error('Erro ao finalizar chamada:', error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setFinalizando(false);
    }
  };

  // Verificar conquistas desbloqueadas
  const verificarConquistas = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/gamificacao/verificar-conquistas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data.novas_conquistas?.length > 0) {
        data.data.novas_conquistas.forEach((conquista: any) => {
          toast.success(
            `🏆 Nova conquista desbloqueada: ${conquista.nome}!`,
            { duration: 5000 }
          );
        });
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  };

  // Cancelar finalização
  const cancelarFinalizacao = () => {
    setMostrarFormFinalizar(false);
    setMostrarModalAtiva(true);
  };

  return (
    <div className="space-y-4">
      {/* Componente de discagem */}
      <DialpadDiscagem
        onIniciarChamada={iniciarChamada}
        onFinalizarChamada={prepararFinalizacao}
        emChamada={emChamada}
        disabled={finalizando}
      />

      {/* Modal de chamada ativa */}
      {chamadaAtiva && (
        <ModalChamadaAtiva
          aberto={mostrarModalAtiva}
          numeroChamada={chamadaAtiva.numero}
          tipoChamada={chamadaAtiva.tipo}
          onFechar={() => setMostrarModalAtiva(false)}
        />
      )}

      {/* Form de finalização */}
      {chamadaAtiva && (
        <FormFinalizarChamada
          aberto={mostrarFormFinalizar}
          chamadaId={chamadaAtiva.id}
          numeroChamada={chamadaAtiva.numero}
          duracao={duracaoChamada}
          onFinalizar={finalizarChamada}
          onCancelar={cancelarFinalizacao}
        />
      )}
    </div>
  );
};

export default SistemaDiscagem;

