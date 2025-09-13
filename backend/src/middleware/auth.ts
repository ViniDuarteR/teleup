import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest, Operador } from '../types';

// Middleware de autenticação
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui') as any;
    
    // Verificar se a sessão ainda está ativa no banco
    const [sessions] = await pool.execute(
      'SELECT * FROM sessoes WHERE operador_id = ? AND token = ? AND ativo = TRUE AND expiracao > NOW()',
      [decoded.operadorId, token]
    );

    if ((sessions as any[]).length === 0) {
      res.status(401).json({ 
        success: false, 
        message: 'Sessão expirada ou inválida' 
      });
      return;
    }

    // Buscar dados do operador
    const [operadores] = await pool.execute(
      'SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status FROM operadores WHERE id = ?',
      [decoded.operadorId]
    );

    if ((operadores as Operador[]).length === 0) {
      res.status(401).json({ 
        success: false, 
        message: 'Operador não encontrado' 
      });
      return;
    }

    req.operador = (operadores as Operador[])[0];
    req.token = token;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Middleware para verificar se é gestor (nível >= 10)
export const requireGestor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.operador.nivel < 10) {
    res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Nível de gestor necessário.' 
    });
    return;
  }
  next();
};

// Middleware para verificar se operador está online
export const requireOnline = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.operador.status === 'Offline') {
    res.status(403).json({ 
      success: false, 
      message: 'Operador deve estar online para esta ação' 
    });
    return;
  }
  next();
};
