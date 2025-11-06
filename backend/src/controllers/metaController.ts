import { Response } from 'express';
import mongoose from 'mongoose';
import { Meta, Operador, Gestor, ProgressoMeta } from '../models';
import { AuthRequest, ApiResponse } from '../types';

export const listarMetasOperador = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const { operadorId } = req.params;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const operador = await Operador.findOne({
      _id: operadorId,
      gestor_id: gestorId
    });

    if (!operador) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para ver as metas deste operador'
      });
      return;
    }

    const metas = await Meta.find({ empresa_id: gestor.empresa_id })
      .populate('empresa_id', 'nome')
      .sort({ data_criacao: -1 });

    res.json({
      success: true,
      data: metas.map(m => ({
        id: m._id.toString(),
        empresa_id: m.empresa_id.toString(),
        titulo: m.titulo,
        descricao: m.descricao,
        tipo: m.tipo,
        valor_meta: m.valor_meta,
        periodo: m.periodo,
        data_inicio: m.data_inicio,
        data_fim: m.data_fim,
        ativa: m.ativa,
        criado_em: m.criado_em,
        atualizado_em: m.atualizado_em
      }))
    });
  } catch (error) {
    console.error('Erro ao listar metas do operador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const criarMeta = async (req: AuthRequest, res: Response<ApiResponse<{ id: string }>>): Promise<void> => {
  try {
    const { operador_id, tipo_meta, valor_meta, periodo, data_inicio, data_fim, pontos_recompensa } = req.body;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    if (!operador_id || !tipo_meta || !valor_meta || !periodo || !data_inicio || !data_fim) {
      res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: operador_id, tipo_meta, valor_meta, periodo, data_inicio, data_fim'
      });
      return;
    }

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const operador = await Operador.findOne({
      _id: operador_id,
      gestor_id: gestorId
    });

    if (!operador) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para criar metas para este operador'
      });
      return;
    }

    const meta = await Meta.create({
      empresa_id: gestor.empresa_id,
      titulo: `${tipo_meta} - ${periodo}`,
      descricao: `Meta de ${tipo_meta} para o período ${periodo}`,
      tipo: tipo_meta,
      valor_meta,
      periodo,
      data_inicio: new Date(data_inicio),
      data_fim: new Date(data_fim),
      ativa: true
    });

    res.json({
      success: true,
      message: 'Meta criada com sucesso',
      data: { id: meta._id.toString() }
    });
  } catch (error) {
    console.error('❌ [CRIAR META] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const atualizarMeta = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const { tipo_meta, valor_meta, periodo, data_inicio, data_fim, ativa, pontos_recompensa } = req.body;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const meta = await Meta.findOne({
      _id: id,
      empresa_id: gestor.empresa_id
    });

    if (!meta) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar esta meta'
      });
      return;
    }

    const updateData: any = {};
    if (tipo_meta) updateData.tipo = tipo_meta;
    if (valor_meta) updateData.valor_meta = valor_meta;
    if (periodo) updateData.periodo = periodo;
    if (data_inicio) updateData.data_inicio = new Date(data_inicio);
    if (data_fim) updateData.data_fim = new Date(data_fim);
    if (ativa !== undefined) updateData.ativa = ativa;

    await Meta.updateOne({ _id: id }, updateData);

    res.json({
      success: true,
      message: 'Meta atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const excluirMeta = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const meta = await Meta.findOne({
      _id: id,
      empresa_id: gestor.empresa_id
    });

    if (!meta) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para excluir esta meta'
      });
      return;
    }

    await Meta.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Meta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const listarTodasMetas = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const operadores = await Operador.find({ gestor_id: gestorId }).select('_id');
    const operadoresIds = operadores.map(op => op._id);

    const metas = await Meta.find({ empresa_id: gestor.empresa_id })
      .populate('empresa_id', 'nome')
      .sort({ data_criacao: -1 });

    res.json({
      success: true,
      data: metas.map(m => ({
        id: m._id.toString(),
        empresa_id: m.empresa_id.toString(),
        titulo: m.titulo,
        descricao: m.descricao,
        tipo: m.tipo,
        valor_meta: m.valor_meta,
        periodo: m.periodo,
        data_inicio: m.data_inicio,
        data_fim: m.data_fim,
        ativa: m.ativa,
        criado_em: m.criado_em,
        atualizado_em: m.atualizado_em
      }))
    });
  } catch (error) {
    console.error('Erro ao listar todas as metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
