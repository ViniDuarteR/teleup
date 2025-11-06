import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Empresa, Gestor, Operador, Sessao, Chamada } from '../models';
import { ApiResponse, AuthRequest } from '../types';

// Cadastro de empresa
export const cadastrarEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, telefone, cnpj, endereco, cidade, estado, cep } = req.body;

    if (!nome || !email || !senha || !cnpj) {
      res.status(400).json({
        success: false,
        message: 'Nome, email, senha e CNPJ são obrigatórios'
      });
      return;
    }

    // Verificar se email já existe
    const empresaExistente = await Empresa.findOne({ email });

    if (empresaExistente) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
      return;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar empresa
    const empresa = await Empresa.create({
      nome,
      email,
      senha: senhaHash,
      telefone: telefone || null,
      cnpj,
      endereco: endereco || null,
      cidade: cidade || null,
      estado: estado || null,
      cep: cep || null,
      status: 'Ativo'
    });

    res.status(201).json({
      success: true,
      message: 'Empresa cadastrada com sucesso',
      data: {
        id: empresa._id.toString(),
        nome,
        email
      }
    });

  } catch (error: any) {
    console.error(`❌ [CADASTRO EMPRESA] Erro no cadastro da empresa:`, error);

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email ou CNPJ já cadastrado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login da empresa
export const loginEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    // Buscar empresa
    const empresa = await Empresa.findOne({ email, status: 'Ativo' });

    if (!empresa) {
      res.status(401).json({
        success: false,
        message: 'Empresa não encontrada ou inativa'
      });
      return;
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, empresa.senha);
    
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        empresaId: empresa._id.toString(), 
        tipo: 'empresa',
        email: empresa.email 
      },
      process.env.JWT_SECRET || 'teleup_secret',
      { expiresIn: '24h' }
    );

    // Salvar sessão
    const expiracao = new Date();
    expiracao.setHours(expiracao.getHours() + 24);

    await Sessao.create({
      empresa_id: empresa._id,
      token,
      expiracao,
      ativo: true
    });

    // Atualizar último login
    await Empresa.updateOne(
      { _id: empresa._id },
      { data_ultimo_login: new Date() }
    );

    const empresaData = {
      id: empresa._id.toString(),
      nome: empresa.nome,
      email: empresa.email,
      status: empresa.status
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        empresa: empresaData
      }
    });
  } catch (error: any) {
    console.error(`❌ [EMPRESA LOGIN] Erro no login da empresa:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar gestores da empresa
export const listarGestoresEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const empresaId = new mongoose.Types.ObjectId(req.empresa?.id || '');

    const gestores = await Gestor.aggregate([
      { $match: { empresa_id: empresaId } },
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
          avatar: 1,
          data_criacao: 1,
          data_atualizacao: 1,
          data_ultimo_login: 1,
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

    res.json({
      success: true,
      data: gestores
    });
  } catch (error) {
    console.error('Erro ao listar gestores da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar gestor para a empresa
export const criarGestorEmpresa = async (req: AuthRequest, res: Response<ApiResponse<{ id: string }>>): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    const empresaId = new mongoose.Types.ObjectId(req.empresa?.id || '');

    // Verificar se email já existe
    const emailExists = await Gestor.findOne({ email });

    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
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

// Listar operadores da empresa
export const listarOperadoresEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const empresaId = new mongoose.Types.ObjectId(req.empresa?.id || '');

    const operadores = await Operador.find({ empresa_id: empresaId })
      .populate('gestor_id', 'nome email')
      .sort({ pontos_totais: -1 })
      .select('nome email nivel xp pontos_totais status avatar tempo_online pa carteira data_criacao');

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
        gestor_nome: (op.gestor_id as any)?.nome,
        gestor_email: (op.gestor_id as any)?.email
      }))
    });
  } catch (error) {
    console.error('Erro ao listar operadores da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Dashboard da empresa
export const getDashboardEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const empresaId = new mongoose.Types.ObjectId(req.empresa?.id || '');

    const totalGestores = await Gestor.countDocuments({ empresa_id: empresaId });
    const totalOperadores = await Operador.countDocuments({ empresa_id: empresaId });
    const operadoresOnline = await Operador.countDocuments({
      empresa_id: empresaId,
      status_operacional: 'Aguardando Chamada'
    });

    // Buscar chamadas de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const operadoresIds = await Operador.find({ empresa_id: empresaId }).select('_id');
    const operadoresIdsArray = operadoresIds.map(op => op._id);

    const chamadasHoje = await Chamada.countDocuments({
      operador_id: { $in: operadoresIdsArray },
      inicio_chamada: { $gte: hoje, $lt: amanha }
    });

    const chamadas = await Chamada.find({
      operador_id: { $in: operadoresIdsArray }
    });

    const satisfacaoMedia = chamadas.length > 0
      ? chamadas.reduce((sum, c) => sum + (c.satisfacao_cliente || 0), 0) / chamadas.length
      : 0;

    const tempoMedioAtendimento = chamadas.length > 0
      ? chamadas.reduce((sum, c) => sum + (c.duracao_segundos || 0), 0) / chamadas.length / 60
      : 0;

    const taxaResolucao = chamadas.length > 0
      ? (chamadas.filter(c => c.resolvida).length / chamadas.length) * 100
      : 0;

    const dashboardData = {
      totalGestores,
      totalOperadores,
      operadoresOnline,
      chamadasHoje,
      metaDiaria: 100,
      satisfacaoMedia: Math.round(satisfacaoMedia * 10) / 10,
      tempoMedioAtendimento: Math.round(tempoMedioAtendimento),
      taxaResolucao: Math.round(taxaResolucao)
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ [DASHBOARD EMPRESA] Erro ao buscar dashboard da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar avatar da empresa
export const atualizarAvatarEmpresa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = new mongoose.Types.ObjectId(req.empresa?.id || '');

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Arquivo de imagem é obrigatório'
      });
      return;
    }

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/empresas/${req.file.filename}`;

    await Empresa.updateOne(
      { _id: empresaId },
      { avatar: avatarUrl }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      data: { avatar: avatarUrl }
    });

  } catch (error: any) {
    console.error('❌ [ATUALIZAR AVATAR EMPRESA] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
