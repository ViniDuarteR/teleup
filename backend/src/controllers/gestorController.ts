import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest, LoginRequest, LoginResponse, ApiResponse } from '../types';

// Login do gestor
export const loginGestor = async (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    // Buscar gestor por email
    const [gestores] = await pool.execute(
      'SELECT * FROM gestores WHERE email = ? AND status = "Ativo"',
      [email]
    );

    if ((gestores as any[]).length === 0) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    const gestor = (gestores as any[])[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, gestor.senha);
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign(
      { gestorId: gestor.id, email: gestor.email, tipo: 'gestor' },
      process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Salvar sessão no banco (usando a tabela sessoes existente)
    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);

    await pool.execute(
      'INSERT INTO sessoes (operador_id, token, expiracao) VALUES (?, ?, ?)',
      [gestor.id, token, dataExpiracao]
    );

    // Preparar dados do gestor (sem campos de gamificação)
    const gestorData: any = {
      id: gestor.id,
      nome: gestor.nome,
      email: gestor.email,
      tipo: 'gestor',
      status: gestor.status,
      avatar: gestor.avatar,
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

  } catch (error) {
    console.error('Erro no login do gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Logout do gestor
export const logoutGestor = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const token = req.token;

    if (token) {
      // Invalidar sessão no banco
      await pool.execute(
        'UPDATE sessoes SET ativo = FALSE WHERE token = ?',
        [token]
      );
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout do gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter operadores gerenciados pelo gestor
export const getOperadoresGerenciados = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const gestorId = req.user?.id;

    const [operadores] = await pool.execute(`
      SELECT 
        o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, 
        o.pontos_totais, o.status, o.avatar, o.tempo_online,
        og.data_atribuicao
      FROM operadores o
      INNER JOIN operador_gestor og ON o.id = og.operador_id
      WHERE og.gestor_id = ? AND og.ativo = TRUE
      ORDER BY o.nome
    `, [gestorId]);

    res.json({
      success: true,
      data: operadores as any[]
    });

  } catch (error) {
    console.error('Erro ao buscar operadores gerenciados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atribuir operador a um gestor
export const atribuirOperador = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { operador_id } = req.body;
    const gestorId = req.user?.id;

    if (!operador_id) {
      res.status(400).json({
        success: false,
        message: 'ID do operador é obrigatório'
      });
      return;
    }

    // Verificar se o operador existe
    const [operadores] = await pool.execute(
      'SELECT id FROM operadores WHERE id = ?',
      [operador_id]
    );

    if ((operadores as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    // Atribuir operador ao gestor
    await pool.execute(`
      INSERT INTO operador_gestor (operador_id, gestor_id, ativo)
      VALUES (?, ?, TRUE)
      ON DUPLICATE KEY UPDATE ativo = TRUE, data_atribuicao = CURRENT_TIMESTAMP
    `, [operador_id, gestorId]);

    res.json({
      success: true,
      message: 'Operador atribuído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atribuir operador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Remover operador de um gestor
export const removerOperador = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { operador_id } = req.body;
    const gestorId = req.user?.id;

    if (!operador_id) {
      res.status(400).json({
        success: false,
        message: 'ID do operador é obrigatório'
      });
      return;
    }

    // Remover atribuição
    await pool.execute(
      'UPDATE operador_gestor SET ativo = FALSE WHERE operador_id = ? AND gestor_id = ?',
      [operador_id, gestorId]
    );

    res.json({
      success: true,
      message: 'Operador removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover operador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};