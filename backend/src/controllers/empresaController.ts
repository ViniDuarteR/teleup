import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { ApiResponse, AuthRequest } from '../types';

// Login da empresa
export const loginEmpresa = async (req: Request, res: Response<ApiResponse<{ token: string; empresa: any }>>): Promise<void> => {
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
    const [empresas] = await pool.execute(
      'SELECT id, nome, email, senha, status FROM empresas WHERE email = ? AND status = "Ativo"',
      [email]
    );

    const empresa = (empresas as any[])[0];

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
        empresaId: empresa.id, 
        tipo: 'empresa',
        email: empresa.email 
      },
      process.env.JWT_SECRET || 'teleup_secret',
      { expiresIn: '24h' }
    );

    // Salvar sessão
    const expiracao = new Date();
    expiracao.setHours(expiracao.getHours() + 24);

    await pool.execute(
      'INSERT INTO sessoes_empresa (empresa_id, token, expiracao) VALUES (?, ?, ?)',
      [empresa.id, token, expiracao]
    );

    // Atualizar último login
    await pool.execute(
      'UPDATE empresas SET data_ultimo_login = NOW() WHERE id = ?',
      [empresa.id]
    );

    // Preparar dados da empresa (sem senha)
    const empresaData = {
      id: empresa.id,
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
  } catch (error) {
    console.error('Erro no login da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar gestores da empresa
export const listarGestoresEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    const [gestores] = await pool.execute(
      'SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE empresa_id = ?',
      [empresaId]
    );

    res.json({
      success: true,
      data: gestores as any[]
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
export const criarGestorEmpresa = async (req: AuthRequest, res: Response<ApiResponse<{ id: number }>>): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    // Verificar se email já existe
    const [emailExists] = await pool.execute(
      'SELECT id FROM gestores WHERE email = ?',
      [email]
    );

    if ((emailExists as any[]).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.execute(
      'INSERT INTO gestores (nome, email, senha, status, avatar, empresa_id) VALUES (?, ?, ?, "Ativo", "avatar_gestor.png", ?)',
      [nome, email, senhaHash, empresaId]
    );

    const insertResult = result as any;
    res.status(201).json({
      success: true,
      message: 'Gestor criado com sucesso',
      data: { id: insertResult.insertId }
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
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    const [operadores] = await pool.execute(
      `SELECT o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, o.pontos_totais, 
              o.status, o.avatar, o.tempo_online, o.pa, o.carteira, o.data_criacao,
              g.nome as gestor_nome, g.email as gestor_email
       FROM operadores o
       LEFT JOIN operador_gestor og ON o.id = og.operador_id
       LEFT JOIN gestores g ON og.gestor_id = g.id
       WHERE o.empresa_id = ?
       ORDER BY o.pontos_totais DESC`,
      [empresaId]
    );

    res.json({
      success: true,
      data: operadores as any[]
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
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    // Buscar estatísticas da empresa
    const [totalGestores] = await pool.execute(
      'SELECT COUNT(*) as total FROM gestores WHERE empresa_id = ?',
      [empresaId]
    );

    const [totalOperadores] = await pool.execute(
      'SELECT COUNT(*) as total FROM operadores WHERE empresa_id = ?',
      [empresaId]
    );

    const [operadoresAtivos] = await pool.execute(
      'SELECT COUNT(*) as total FROM operadores WHERE empresa_id = ? AND status IN ("Dispon??vel", "Em Chamada")',
      [empresaId]
    );

    const [totalPontos] = await pool.execute(
      'SELECT COALESCE(SUM(pontos_totais), 0) as total FROM operadores WHERE empresa_id = ?',
      [empresaId]
    );

    res.json({
      success: true,
      data: {
        totalGestores: (totalGestores as any[])[0].total,
        totalOperadores: (totalOperadores as any[])[0].total,
        operadoresAtivos: (operadoresAtivos as any[])[0].total,
        totalPontos: (totalPontos as any[])[0].total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
