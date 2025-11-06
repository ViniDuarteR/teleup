import { Response } from 'express';
import mongoose from 'mongoose';
import { Chamada, Operador } from '../models';
import { AuthRequest, IniciarChamadaRequest, FinalizarChamadaRequest, ApiResponse } from '../types';

// Iniciar uma nova chamada
export const iniciarChamada = async (req: AuthRequest, res: Response<ApiResponse<{ chamada_id: string; operador_id: string; status: string }>>): Promise<void> => {
  try {
    const { numero_cliente, tipo_chamada = 'Entrada' } = req.body as IniciarChamadaRequest;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    // Verificar se operador está disponível
    if (req.operador.status_operacional !== 'Aguardando Chamada') {
      res.status(400).json({
        success: false,
        message: 'Operador deve estar aguardando chamada para iniciar uma nova'
      });
      return;
    }

    // Criar nova chamada
    const chamada = await Chamada.create({
      operador_id: operadorId,
      numero_cliente,
      tipo_chamada,
      status: 'Em Andamento',
      inicio_chamada: new Date()
    });

    // Atualizar status do operador
    await Operador.updateOne(
      { _id: operadorId },
      { status_operacional: 'Em Chamada' }
    );

    res.json({
      success: true,
      message: 'Chamada iniciada com sucesso',
      data: {
        chamada_id: chamada._id.toString(),
        operador_id: req.operador.id,
        status: 'Em Chamada'
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar chamada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Finalizar uma chamada
export const finalizarChamada = async (req: AuthRequest, res: Response<ApiResponse<{ duracao_segundos: number; pontos_ganhos: number; status: string }>>): Promise<void> => {
  try {
    const { chamada_id, satisfacao_cliente, resolvida, observacoes } = req.body as FinalizarChamadaRequest;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);
    const chamadaObjectId = new mongoose.Types.ObjectId(chamada_id);

    // Buscar chamada
    const chamada = await Chamada.findOne({
      _id: chamadaObjectId,
      operador_id: operadorId,
      status: 'Em Andamento'
    });

    if (!chamada) {
      res.status(404).json({
        success: false,
        message: 'Chamada não encontrada ou já finalizada'
      });
      return;
    }

    const agora = new Date();
    const duracaoSegundos = Math.floor((agora.getTime() - chamada.inicio_chamada.getTime()) / 1000);

    // Calcular pontos baseado na duração e satisfação
    let pontosGanhos = 10; // Base
    if (resolvida) pontosGanhos += 20;
    if (satisfacao_cliente && satisfacao_cliente >= 4) pontosGanhos += 15;
    if (satisfacao_cliente === 5) pontosGanhos += 10;

    // Finalizar chamada
    await Chamada.updateOne(
      { _id: chamadaObjectId },
      {
        fim_chamada: agora,
        duracao_segundos: duracaoSegundos,
        status: 'Finalizada',
        satisfacao_cliente,
        resolvida,
        observacoes,
        pontos_ganhos: pontosGanhos
      }
    );

    // Atualizar pontos do operador
    await Operador.updateOne(
      { _id: operadorId },
      { $inc: { pontos_totais: pontosGanhos } }
    );

    // Atualizar status do operador
    await Operador.updateOne(
      { _id: operadorId },
      { status_operacional: 'Aguardando Chamada' }
    );

    res.json({
      success: true,
      message: 'Chamada finalizada com sucesso',
      data: {
        duracao_segundos: duracaoSegundos,
        pontos_ganhos: pontosGanhos,
        status: 'Aguardando Chamada'
      }
    });

  } catch (error) {
    console.error('Erro ao finalizar chamada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter histórico de chamadas
export const getHistorico = async (req: AuthRequest, res: Response<ApiResponse<{ chamadas: any[]; paginacao: { total: number; limite: number; offset: number } }>>): Promise<void> => {
  try {
    const { data_inicio, data_fim, limite = 50, offset = 0 } = req.query;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    const query: any = { operador_id: operadorId };

    if (data_inicio || data_fim) {
      query.inicio_chamada = {};
      if (data_inicio) {
        const inicio = new Date(data_inicio as string);
        inicio.setHours(0, 0, 0, 0);
        query.inicio_chamada.$gte = inicio;
      }
      if (data_fim) {
        const fim = new Date(data_fim as string);
        fim.setHours(23, 59, 59, 999);
        query.inicio_chamada.$lte = fim;
      }
    }

    const chamadas = await Chamada.find(query)
      .sort({ inicio_chamada: -1 })
      .limit(parseInt(limite as string))
      .skip(parseInt(offset as string))
      .select('numero_cliente inicio_chamada fim_chamada duracao_segundos tipo_chamada status satisfacao_cliente resolvida observacoes pontos_ganhos');

    const total = await Chamada.countDocuments(query);

    res.json({
      success: true,
      data: {
        chamadas: chamadas.map(c => ({
          id: c._id.toString(),
          numero_cliente: c.numero_cliente,
          inicio_chamada: c.inicio_chamada,
          fim_chamada: c.fim_chamada,
          duracao_segundos: c.duracao_segundos,
          tipo_chamada: c.tipo_chamada,
          status: c.status,
          satisfacao_cliente: c.satisfacao_cliente,
          resolvida: c.resolvida,
          observacoes: c.observacoes,
          pontos_ganhos: c.pontos_ganhos
        })),
        paginacao: {
          total,
          limite: parseInt(limite as string),
          offset: parseInt(offset as string)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de chamadas
export const getEstatisticas = async (req: AuthRequest, res: Response<ApiResponse<{
  periodo: string;
  total_chamadas: number;
  tempo_total_minutos: number;
  tempo_medio_minutos: number;
  satisfacao_media: number;
  taxa_resolucao: number;
  pontos_ganhos: number;
}>>): Promise<void> => {
  try {
    const { periodo = 'hoje' } = req.query;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    const agora = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case 'hoje':
        dataInicio = new Date(agora);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataInicio = new Date(agora);
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case 'mes':
        dataInicio = new Date(agora);
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        break;
      default:
        dataInicio = new Date(agora);
        dataInicio.setHours(0, 0, 0, 0);
    }

    const chamadas = await Chamada.find({
      operador_id: operadorId,
      inicio_chamada: { $gte: dataInicio }
    });

    const total_chamadas = chamadas.length;
    const tempo_total_segundos = chamadas.reduce((sum, c) => sum + (c.duracao_segundos || 0), 0);
    const tempo_medio_segundos = total_chamadas > 0 ? tempo_total_segundos / total_chamadas : 0;
    const satisfacao_media = chamadas.length > 0
      ? chamadas.reduce((sum, c) => sum + (c.satisfacao_cliente || 0), 0) / chamadas.length
      : 0;
    const total_resolucoes = chamadas.filter(c => c.resolvida).length;
    const pontos_ganhos = chamadas.reduce((sum, c) => sum + (c.pontos_ganhos || 0), 0);

    res.json({
      success: true,
      data: {
        periodo: periodo as string,
        total_chamadas,
        tempo_total_minutos: Math.floor(tempo_total_segundos / 60),
        tempo_medio_minutos: Math.floor(tempo_medio_segundos / 60),
        satisfacao_media: Math.round(satisfacao_media * 10) / 10,
        taxa_resolucao: total_chamadas > 0
          ? Math.round((total_resolucoes / total_chamadas) * 100)
          : 0,
        pontos_ganhos
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
