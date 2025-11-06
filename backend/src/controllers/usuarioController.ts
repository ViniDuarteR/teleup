import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Operador, Gestor, Empresa } from '../models';
import { AuthRequest, ApiResponse, Operador as OperadorType } from '../types';

export const listarUsuarios = async (req: AuthRequest, res: Response<ApiResponse<OperadorType[]>>): Promise<void> => {
  try {
    let empresaId: mongoose.Types.ObjectId | null = null;

    if (req.operador.tipo === 'gestor') {
      const gestorId = new mongoose.Types.ObjectId(req.operador.id);
      const gestor = await Gestor.findById(gestorId);
      if (!gestor) {
        res.status(404).json({
          success: false,
          message: 'Gestor não encontrado'
        });
        return;
      }
      empresaId = gestor.empresa_id;
    } else {
      const operadorId = new mongoose.Types.ObjectId(req.operador.id);
      const operador = await Operador.findById(operadorId);
      if (!operador) {
        res.status(404).json({
          success: false,
          message: 'Operador não encontrado'
        });
        return;
      }
      empresaId = operador.empresa_id;
    }

    const operadores = await Operador.find({ empresa_id: empresaId })
      .sort({ pontos_totais: -1 })
      .select('nome email nivel xp pontos_totais status status_operacional avatar tempo_online pa carteira data_criacao data_atualizacao');

    res.json({
      success: true,
      data: operadores.map(op => ({
        id: op._id.toString(),
        nome: op.nome,
        email: op.email,
        tipo: 'operador' as const,
        nivel: op.nivel,
        xp_atual: op.xp,
        xp_proximo_nivel: op.nivel * 100,
        pontos_totais: op.pontos_totais,
        status: op.status,
        status_operacional: op.status_operacional,
        avatar: op.avatar,
        tempo_online: op.tempo_online,
        pa: op.pa,
        carteira: op.carteira,
        data_criacao: op.data_criacao,
        data_atualizacao: op.data_atualizacao,
        senha: '' // Campo obrigatório mas não exposto
      }))
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const criarUsuario = async (req: Request, res: Response<ApiResponse<{ id: string }>>): Promise<void> => {
  try {
    const { nome, email, senha, nivel = 1, pa = '', carteira = '', empresa_id } = req.body;

    if (!nome || !email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
      return;
    }

    let empresaId: mongoose.Types.ObjectId;
    if (empresa_id) {
      empresaId = new mongoose.Types.ObjectId(empresa_id);
    } else {
      const empresa = await Empresa.findOne();
      if (!empresa) {
        res.status(404).json({
          success: false,
          message: 'Nenhuma empresa encontrada'
        });
        return;
      }
      empresaId = new mongoose.Types.ObjectId(empresa._id.toString());
    }

    const emailExists = await Operador.findOne({ email, empresa_id: empresaId });
    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado nesta empresa'
      });
      return;
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
      pa,
      carteira,
      status_operacional: 'Offline'
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { id: operador._id.toString() }
    });
  } catch (error: any) {
    console.error('❌ [USUARIO CREATE] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const atualizarUsuario = async (req: AuthRequest, res: Response<ApiResponse<void>>): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, nivel, status } = req.body;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    const operadorAtual = await Operador.findById(operadorId);
    if (!operadorAtual) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const usuarioParaAtualizar = await Operador.findById(id);
    if (!usuarioParaAtualizar) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    if (!usuarioParaAtualizar.empresa_id.equals(operadorAtual.empresa_id)) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    if (email) {
      const emailExists = await Operador.findOne({
        email,
        empresa_id: operadorAtual.empresa_id,
        _id: { $ne: id }
      });
      if (emailExists) {
        res.status(400).json({
          success: false,
          message: 'Email já cadastrado nesta empresa'
        });
        return;
      }
    }

    const updateData: any = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (nivel) {
      updateData.nivel = nivel;
      updateData.xp_proximo_nivel = nivel * 100;
    }
    if (status) updateData.status = status;

    await Operador.updateOne({ _id: id }, updateData);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const excluirUsuario = async (req: AuthRequest, res: Response<ApiResponse<void>>): Promise<void> => {
  try {
    const { id } = req.params;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    if (id === operadorId.toString()) {
      res.status(400).json({
        success: false,
        message: 'Não é possível excluir seu próprio usuário'
      });
      return;
    }

    const operadorAtual = await Operador.findById(operadorId);
    if (!operadorAtual) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const usuarioParaExcluir = await Operador.findById(id);
    if (!usuarioParaExcluir) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    if (!usuarioParaExcluir.empresa_id.equals(operadorAtual.empresa_id)) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    await Operador.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const redefinirSenha = async (req: AuthRequest, res: Response<ApiResponse<void>>): Promise<void> => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    const operadorId = new mongoose.Types.ObjectId(req.operador.id);

    const operadorAtual = await Operador.findById(operadorId);
    if (!operadorAtual) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const usuarioParaAtualizar = await Operador.findById(id);
    if (!usuarioParaAtualizar) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    if (!usuarioParaAtualizar.empresa_id.equals(operadorAtual.empresa_id)) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await Operador.updateOne(
      { _id: id },
      { senha: senhaHash }
    );

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
