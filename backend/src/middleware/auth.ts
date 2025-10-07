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
    let sessions: any[] = [];
    
    if (decoded.tipo === 'gestor') {
      // Para gestores, verificar sessoes_empresa
      const [empresaSessions] = await pool.execute(
        'SELECT * FROM sessoes_empresa WHERE empresa_id = (SELECT empresa_id FROM gestores WHERE id = ?) AND token = ? AND ativo = TRUE AND expiracao > NOW()',
        [decoded.gestorId, token]
      );
      sessions = empresaSessions as any[];
    } else {
      // Para operadores, verificar sessoes
      const [operadorSessions] = await pool.execute(
        'SELECT * FROM sessoes WHERE operador_id = ? AND token = ? AND ativo = TRUE AND expiracao > NOW()',
        [decoded.operadorId, token]
      );
      sessions = operadorSessions as any[];
    }

    if (sessions.length === 0) {
      res.status(401).json({ 
        success: false, 
        message: 'Sessão expirada ou inválida' 
      });
      return;
    }

    // Verificar se é gestor ou operador
    if (decoded.tipo === 'gestor') {
      // Buscar dados do gestor
      const [gestores] = await pool.execute(
        'SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE id = ? AND status = "Ativo"',
        [decoded.gestorId]
      );

      if ((gestores as any[]).length === 0) {
        res.status(401).json({ 
          success: false, 
          message: 'Gestor não encontrado' 
        });
        return;
      }

      const gestor = (gestores as any[])[0];
      req.operador = {
        id: gestor.id,
        nome: gestor.nome,
        email: gestor.email,
        tipo: 'gestor',
        status: gestor.status,
        avatar: gestor.avatar,
        data_criacao: gestor.data_criacao,
        data_atualizacao: gestor.data_atualizacao
      } as any;
      req.user = {
        id: gestor.id,
        email: gestor.email,
        tipo: 'gestor'
      };
    } else {
      // Buscar dados do operador
      const [operadores] = await pool.execute(
        'SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status, avatar, tempo_online, data_criacao, data_atualizacao FROM operadores WHERE id = ?',
        [decoded.operadorId]
      );

      if ((operadores as Operador[]).length === 0) {
        res.status(401).json({ 
          success: false, 
          message: 'Operador não encontrado' 
        });
        return;
      }

      const operador = (operadores as Operador[])[0];
      req.operador = operador;
      req.user = {
        id: operador.id,
        email: operador.email,
        tipo: 'operador'
      };
    }
    
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

// Middleware para verificar se é gestor
export const requireGestor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.operador.tipo !== 'gestor') {
    res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Permissão de gestor necessária.' 
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
