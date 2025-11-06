import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Gestor, Operador, Sessao } from '../models';
import { ApiResponse, LoginRequest } from '../types';

export const loginGestor = async (req: Request<{}, any, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    const gestor = await Gestor.findOne({ email, status: 'Ativo' });

    if (!gestor) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, gestor.senha);
    
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    const token = jwt.sign(
      { gestorId: gestor._id.toString(), email: gestor.email, tipo: 'gestor' },
      process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);

    await Sessao.create({
      empresa_id: gestor.empresa_id,
      token,
      expiracao: dataExpiracao,
      ativo: true
    });

    const gestorData: any = {
      id: gestor._id.toString(),
      nome: gestor.nome,
      email: gestor.email,
      tipo: 'gestor',
      status: gestor.status,
      avatar: gestor.avatar ? `${process.env.API_BASE_URL || 'https://teleup-backend.vercel.app'}/uploads/${gestor.avatar}` : `${process.env.API_BASE_URL || 'https://teleup-backend.vercel.app'}/avatar_gestor.png`,
      data_criacao: gestor.data_criacao,
      data_atualizacao: gestor.data_atualizacao
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        operador: gestorData
      }
    });

  } catch (error: any) {
    console.error(`❌ [GESTOR LOGIN] Erro no login do gestor:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar gestores da empresa
export const listarGestores = async (req: any, res: Response): Promise<void> => {
  try {
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);
    
    const gestorAtual = await Gestor.findById(gestorId);
    if (!gestorAtual) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const gestores = await Gestor.find({ empresa_id: gestorAtual.empresa_id })
      .select('nome email status avatar data_criacao data_atualizacao')
      .sort({ nome: 1 });

    const gestoresComAvatar = gestores.map(gestor => ({
      id: gestor._id.toString(),
      nome: gestor.nome,
      email: gestor.email,
      status: gestor.status,
      avatar: gestor.avatar ? `${process.env.API_BASE_URL || 'https://teleup-backend.vercel.app'}/uploads/${gestor.avatar}` : `${process.env.API_BASE_URL || 'https://teleup-backend.vercel.app'}/avatar_gestor.png`,
      data_criacao: gestor.data_criacao,
      data_atualizacao: gestor.data_atualizacao
    }));

    res.json({
      success: true,
      data: gestoresComAvatar
    });
  } catch (error) {
    console.error('Erro ao listar gestores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo gestor
export const criarGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    const gestorAtual = await Gestor.findById(gestorId);
    if (!gestorAtual) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const empresaId = gestorAtual.empresa_id;

    const emailExists = await Gestor.findOne({ email, empresa_id: empresaId });

    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado nesta empresa'
      });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const gestor = await Gestor.create({
      nome,
      email,
      senha: senhaHash,
      status: 'Ativo',
      avatar: 'avatar1.png',
      empresa_id: empresaId
    });

    res.status(201).json({
      success: true,
      message: 'Gestor criado com sucesso',
      data: { id: gestor._id.toString() }
    });

  } catch (error) {
    console.error('Erro ao criar gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar gestor
export const atualizarGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, status } = req.body;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    const gestorAtual = await Gestor.findById(gestorId);
    if (!gestorAtual) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const gestorParaAtualizar = await Gestor.findById(id);

    if (!gestorParaAtualizar) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    if (!gestorParaAtualizar.empresa_id.equals(gestorAtual.empresa_id)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    await Gestor.updateOne(
      { _id: id },
      { nome, email, status }
    );

    res.json({
      success: true,
      message: 'Gestor atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir gestor
export const excluirGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);

    if (id === gestorId.toString()) {
      res.status(400).json({
        success: false,
        message: 'Não é possível excluir seu próprio usuário'
      });
      return;
    }

    const gestorAtual = await Gestor.findById(gestorId);
    if (!gestorAtual) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const gestorParaExcluir = await Gestor.findById(id);

    if (!gestorParaExcluir) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    if (!gestorParaExcluir.empresa_id.equals(gestorAtual.empresa_id)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    await Gestor.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Gestor excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter operadores gerenciados pelo gestor
export const getOperadoresGerenciados = async (req: any, res: Response): Promise<void> => {
  try {
    const gestorId = new mongoose.Types.ObjectId(req.operador.id);
    
    const operadores = await Operador.find({ gestor_id: gestorId })
      .sort({ pontos_totais: -1 })
      .select('nome email nivel xp pontos_totais status avatar tempo_online pa carteira data_criacao data_atualizacao');

    res.json({
      success: true,
      data: operadores.map(op => ({
        id: op._id.toString(),
        nome: op.nome,
        email: op.email,
        nivel: op.nivel,
        xp_atual: op.xp,
        xp_proximo_nivel: op.nivel * 100,
        pontos_totais: op.pontos_totais,
        status: op.status,
        avatar: op.avatar,
        tempo_online: op.tempo_online,
        pa: op.pa,
        carteira: op.carteira,
        data_criacao: op.data_criacao,
        data_atualizacao: op.data_atualizacao
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar operadores gerenciados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
