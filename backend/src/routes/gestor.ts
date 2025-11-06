import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { authenticateToken, requireGestor } from '../middleware/auth';
import { Gestor, Operador, Chamada } from '../models';
import { AuthRequest } from '../types';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.use(authenticateToken as any);
router.use(requireGestor as any);

// Rota para métricas da equipe (com cache de 3 minutos)
router.get('/metricas-equipe', cacheMiddleware({ ttl: 180 }), async (req: AuthRequest, res) => {
  try {
    const gestorId = new mongoose.Types.ObjectId(req.operador?.id || '');
    
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      return res.status(404).json({ success: false, message: 'Gestor não encontrado' });
    }

    const empresaId = gestor.empresa_id;

    const total_operadores = await Operador.countDocuments({ empresa_id: empresaId });
    const operadores_online = await Operador.countDocuments({
      empresa_id: empresaId,
      status_operacional: 'Aguardando Chamada'
    });
    const operadores_em_chamada = await Operador.countDocuments({
      empresa_id: empresaId,
      status_operacional: 'Em Chamada'
    });
    const operadores_em_pausa = await Operador.countDocuments({
      empresa_id: empresaId,
      status_operacional: 'Em Pausa'
    });
    const operadores_offline = await Operador.countDocuments({
      empresa_id: empresaId,
      status_operacional: 'Offline'
    });

    const chamadasAtivas = await Chamada.countDocuments({ status: 'Em Andamento' });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const chamadasHoje = await Chamada.countDocuments({
      inicio_chamada: { $gte: hoje, $lt: amanha }
    });

    const chamadas = await Chamada.find({
      satisfacao_cliente: { $exists: true, $ne: null }
    });

    const satisfacaoMedia = chamadas.length > 0
      ? chamadas.reduce((sum, c) => sum + (c.satisfacao_cliente || 0), 0) / chamadas.length
      : 0;

    return res.json({
      success: true,
      data: {
        total_operadores,
        operadores_online,
        operadores_em_chamada,
        operadores_em_pausa,
        operadores_offline,
        chamadas_ativas: chamadasAtivas,
        chamadas_hoje: chamadasHoje,
        satisfacao_media_geral: Math.round(satisfacaoMedia * 10) / 10,
        meta_diaria_chamadas: 50,
        meta_atingida: chamadasHoje,
        tempo_medio_atendimento: 5.2,
        taxa_resolucao: 87.5
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas da equipe:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para listar operadores
router.get('/operadores', async (req: AuthRequest, res) => {
  try {
    const gestorId = new mongoose.Types.ObjectId(req.operador?.id || '');
    
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      return res.status(404).json({ success: false, message: 'Gestor não encontrado' });
    }

    const empresaId = gestor.empresa_id;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const operadores = await Operador.find({ empresa_id: empresaId })
      .sort({ pontos_totais: -1 })
      .select('nome email nivel pontos_totais status status_operacional avatar tempo_online');

    const operadoresComMetricas = await Promise.all(operadores.map(async (op) => {
      const chamadasHoje = await Chamada.countDocuments({
        operador_id: op._id,
        inicio_chamada: { $gte: hoje, $lt: amanha }
      });

      const chamadas = await Chamada.find({
        operador_id: op._id,
        satisfacao_cliente: { $exists: true, $ne: null }
      });

      const satisfacaoMedia = chamadas.length > 0
        ? chamadas.reduce((sum, c) => sum + (c.satisfacao_cliente || 0), 0) / chamadas.length
        : 0;

      return {
        id: op._id.toString(),
        nome: op.nome,
        email: op.email,
        nivel: op.nivel,
        pontos_totais: op.pontos_totais,
        status: op.status,
        status_operacional: op.status_operacional,
        avatar: op.avatar,
        tempo_online_minutos: op.tempo_online,
        chamadas_hoje: chamadasHoje,
        satisfacao_media: Math.round(satisfacaoMedia * 10) / 10
      };
    }));

    return res.json({
      success: true,
      data: operadoresComMetricas
    });
  } catch (error) {
    console.error('Erro ao buscar operadores:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para criar novo operador
router.post('/operadores', async (req: AuthRequest, res) => {
  try {
    const { nome, email, senha, nivel = 1, pa = '', carteira = '' } = req.body;
    const gestorId = new mongoose.Types.ObjectId(req.operador?.id || '');

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios' });
    }

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      return res.status(404).json({ success: false, message: 'Gestor não encontrado' });
    }

    const empresaId = gestor.empresa_id;

    const emailExists = await Operador.findOne({ email, empresa_id: empresaId });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado nesta empresa' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const operador = await Operador.create({
      nome,
      email,
      senha: senhaHash,
      nivel,
      xp: 0,
      pontos_totais: 0,
      status: 'Ativo',
      avatar: 'avatar1.png',
      tempo_online: 0,
      empresa_id: empresaId,
      gestor_id: gestorId,
      pa,
      carteira,
      status_operacional: 'Offline'
    });

    return res.status(201).json({
      success: true,
      message: 'Operador criado com sucesso',
      data: { id: operador._id.toString() }
    });
  } catch (error: any) {
    console.error('❌ [GESTOR CREATE] Erro:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para alterar status do operador
router.patch('/operador/:id/status', async (req: AuthRequest, res) => {
  try {
    const operadorId = new mongoose.Types.ObjectId(req.params.id);
    const { status } = req.body;
    const gestorId = new mongoose.Types.ObjectId(req.operador?.id || '');

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      return res.status(404).json({ success: false, message: 'Gestor não encontrado' });
    }

    const operador = await Operador.findOne({
      _id: operadorId,
      empresa_id: gestor.empresa_id
    });

    if (!operador) {
      return res.status(404).json({ success: false, message: 'Operador não encontrado' });
    }

    await Operador.updateOne(
      { _id: operadorId },
      { status_operacional: status }
    );

    return res.json({
      success: true,
      message: 'Status do operador atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar status do operador:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para listar outros gestores da empresa
router.get('/outros-gestores', async (req: AuthRequest, res) => {
  try {
    const gestorId = new mongoose.Types.ObjectId(req.operador?.id || '');

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      return res.status(404).json({ success: false, message: 'Gestor não encontrado' });
    }

    const empresaId = gestor.empresa_id;

    const outrosGestores = await Gestor.aggregate([
      { $match: { empresa_id: empresaId, _id: { $ne: gestorId } } },
      {
        $lookup: {
          from: 'operadores',
          localField: '_id',
          foreignField: 'gestor_id',
          as: 'operadores'
        }
      },
      {
        $project: {
          id: { $toString: '$_id' },
          nome: 1,
          email: 1,
          status: 1,
          data_criacao: 1,
          total_operadores: { $size: '$operadores' },
          operadores_online: {
            $size: {
              $filter: {
                input: '$operadores',
                as: 'op',
                cond: { $eq: ['$$op.status_operacional', 'Aguardando Chamada'] }
              }
            }
          }
        }
      },
      { $sort: { data_criacao: -1 } }
    ]);

    return res.json({
      success: true,
      data: outrosGestores
    });
  } catch (error) {
    console.error('Erro ao buscar outros gestores:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;
