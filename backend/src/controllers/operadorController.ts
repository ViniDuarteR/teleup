import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Operador, Sessao, Chamada } from '../models';
import { AuthRequest, LoginRequest, LoginResponse, DashboardData, ApiResponse } from '../types';

// Login do operador
export const login = async (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }
    
    // Buscar operador por email
    const operador = await Operador.findOne({ email });

    if (!operador) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, operador.senha);
    
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign(
      { operadorId: operador._id.toString(), email: operador.email, tipo: 'operador' },
      process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Salvar sessão no banco
    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);

    await Sessao.create({
      operador_id: operador._id,
      token,
      expiracao: dataExpiracao,
      ativo: true
    });

    // Atualizar status para online
    operador.status_operacional = 'Aguardando Chamada';
    await operador.save();

    // Preparar dados do operador
    const operadorData: any = {
      id: operador._id.toString(),
      nome: operador.nome,
      email: operador.email,
      tipo: 'operador',
      status: operador.status,
      status_operacional: 'Aguardando Chamada' as const,
      avatar: operador.avatar,
      data_criacao: operador.data_criacao,
      data_atualizacao: operador.data_atualizacao,
      nivel: operador.nivel,
      xp_atual: operador.xp,
      xp_proximo_nivel: operador.nivel * 100,
      pontos_totais: operador.pontos_totais,
      tempo_online: operador.tempo_online
    };

    console.log(`🎉 [OPERADOR LOGIN] Login realizado com sucesso para: ${email}`);
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        operador: operadorData
      }
    });

  } catch (error: any) {
    console.error(`❌ [OPERADOR LOGIN] Erro no login do operador ${req.body?.email}:`, error);
    console.error(`❌ [OPERADOR LOGIN] Stack trace:`, error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Logout do operador
export const logout = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { token } = req;

    // Desativar sessão
    await Sessao.updateOne(
      { token },
      { ativo: false }
    );

    // Atualizar status para offline
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);
    await Operador.updateOne(
      { _id: operadorId },
      { status_operacional: 'Offline' }
    );

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter dados do dashboard do operador
export const getDashboard = async (req: AuthRequest, res: Response<ApiResponse<DashboardData>>): Promise<void> => {
  try {
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    // Buscar dados do operador
    const operador = await Operador.findById(operadorId);

    if (!operador) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    // Buscar estatísticas do dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const chamadasHoje = await Chamada.find({
      operador_id: operadorId,
      inicio_chamada: { $gte: hoje, $lt: amanha }
    });

    const chamadas_hoje = chamadasHoje.length;
    const tempo_total_segundos = chamadasHoje.reduce((sum, c) => sum + (c.duracao || 0), 0);
    const satisfacao_media = chamadasHoje.length > 0
      ? chamadasHoje.reduce((sum, c) => sum + (c.satisfacao_cliente || 0), 0) / chamadasHoje.length
      : 0;

    res.json({
      success: true,
      data: {
        operador: {
          id: operador._id.toString(),
          nome: operador.nome,
          email: operador.email,
          tipo: 'operador',
          avatar: operador.avatar,
          nivel: operador.nivel,
          xp_atual: operador.xp,
          xp_proximo_nivel: operador.nivel * 100,
          pontos_totais: operador.pontos_totais,
          status: operador.status,
          status_operacional: operador.status_operacional,
          tempo_online: operador.tempo_online,
          data_criacao: operador.data_criacao,
          data_atualizacao: operador.data_atualizacao
        },
        metas: [],
        missoes: [],
        conquistas: [],
        estatisticas: {
          chamadas_hoje,
          tempo_total: Math.floor(tempo_total_segundos / 60),
          satisfacao_media: Math.round(satisfacao_media * 10) / 10,
          resolucoes: 0
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar status do operador
export const updateStatus = async (req: AuthRequest, res: Response<ApiResponse<{ status: string }>>): Promise<void> => {
  try {
    const { status } = req.body;

    const statusValidos = ['Aguardando Chamada', 'Em Chamada', 'Em Pausa', 'Offline'];
    
    if (!statusValidos.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
      return;
    }
    
    // Atualizar status operacional
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);
    await Operador.updateOne(
      { _id: operadorId },
      { status_operacional: status }
    );

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: { status }
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter ranking de operadores
export const getRanking = async (req: AuthRequest, res: Response<ApiResponse<{ ranking: any[]; periodo: string }>>): Promise<void> => {
  try {
    const { periodo = 'semana' } = req.query;

    // Buscar operadores ordenados por pontos
    const operadores = await Operador.find()
      .sort({ pontos_totais: -1 })
      .limit(20)
      .select('nome avatar nivel pontos_totais');

    const ranking = operadores.map((op, index) => ({
      posicao: index + 1,
      id: op._id.toString(),
      nome: op.nome,
      avatar: op.avatar,
      nivel: op.nivel,
      pontos: op.pontos_totais
    }));

    res.json({
      success: true,
      data: {
        ranking,
        periodo: periodo as string
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
