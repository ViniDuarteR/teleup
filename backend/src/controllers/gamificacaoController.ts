import { Response } from 'express';
import mongoose from 'mongoose';
import { Operador, Chamada } from '../models';
import { AuthRequest, ApiResponse, EstatisticasGamificacao } from '../types';

export const getMissoes = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    // Por enquanto retornar array vazio, implementar quando tiver modelo de Missão
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getConquistas = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    // Por enquanto retornar array vazio, implementar quando tiver modelo de Conquista
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const verificarConquistas = async (req: AuthRequest, res: Response<ApiResponse<{ novas_conquistas: any[]; total_novas: number }>>): Promise<void> => {
  try {
    // Por enquanto retornar vazio, implementar quando tiver modelo de Conquista
    res.json({
      success: true,
      data: {
        novas_conquistas: [],
        total_novas: 0
      }
    });
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getRankingGeral = async (req: AuthRequest, res: Response<ApiResponse<{ ranking: any[]; periodo: string; tipo: string }>>): Promise<void> => {
  try {
    const { tipo = 'pontos', periodo = 'semana' } = req.query;

    const operadores = await Operador.find()
      .sort({ pontos_totais: -1 })
      .limit(50)
      .select('nome avatar nivel pontos_totais');

    const ranking = operadores.map((op, index) => ({
      posicao: index + 1,
      id: op._id.toString(),
      nome: op.nome,
      avatar: op.avatar,
      nivel: op.nivel,
      pontos: op.pontos_totais,
      emoji_posicao: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`
    }));

    res.json({
      success: true,
      data: {
        ranking,
        periodo: periodo as string,
        tipo: tipo as string
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getEstatisticasGamificacao = async (req: AuthRequest, res: Response<ApiResponse<EstatisticasGamificacao>>): Promise<void> => {
  try {
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    const operador = await Operador.findById(operadorId);
    if (!operador) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const progressoNivel = (operador.xp / (operador.nivel * 100)) * 100;

    // Buscar posição no ranking
    const operadoresComMaisPontos = await Operador.countDocuments({
      pontos_totais: { $gt: operador.pontos_totais }
    });
    const posicao = operadoresComMaisPontos + 1;

    res.json({
      success: true,
      data: {
        nivel: operador.nivel,
        xp_atual: operador.xp,
        xp_proximo_nivel: operador.nivel * 100,
        progresso_nivel: Math.round(progressoNivel),
        pontos_totais: operador.pontos_totais,
        missoes_concluidas: 0,
        conquistas_desbloqueadas: 0,
        posicao_ranking: posicao
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de gamificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
