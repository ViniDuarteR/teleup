import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest } from '../types';

export const authenticateEmpresa = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
      return;
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'teleup_secret') as any;

    if (decoded.tipo !== 'empresa') {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Token inválido para empresa.'
      });
      return;
    }

    // Verificar se a sessão ainda está ativa
    const [sessoes] = await pool.execute(
      'SELECT * FROM sessoes_empresa WHERE empresa_id = $1 AND token = $2 AND ativo = TRUE AND expiracao > NOW()',
      [decoded.empresaId, token]
    );

    if ((sessoes as any[]).length === 0) {
      res.status(401).json({
        success: false,
        message: 'Sessão expirada ou inválida'
      });
      return;
    }

    // Buscar dados da empresa
    const [empresas] = await pool.execute(
      'SELECT id, nome, email, status, avatar, data_ultimo_login FROM empresas WHERE id = $1 AND status = $2',
      [decoded.empresaId, 'Ativo']
    );

    const empresa = (empresas as any[])[0];

    if (!empresa) {
      res.status(401).json({
        success: false,
        message: 'Empresa não encontrada ou inativa'
      });
      return;
    }

    // Adicionar dados da empresa ao request
    req.empresa = empresa;
    req.token = token;

    next();
  } catch (error: any) {
    console.error(`❌ [EMPRESA AUTH] Erro na autenticação da empresa para ${req.method} ${req.path}:`, error);
    console.error(`❌ [EMPRESA AUTH] Stack trace:`, error.stack);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

export const requireEmpresa = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.empresa) {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. Empresa não autenticada.'
    });
    return;
  }
  next();
};
