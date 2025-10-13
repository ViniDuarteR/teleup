import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest } from '../types';

export const authenticateEmpresa = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log(`🔐 [EMPRESA AUTH] Iniciando autenticação de empresa para ${req.method} ${req.path}`);
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`🔍 [EMPRESA AUTH] Authorization header: ${authHeader ? 'presente' : 'ausente'}`);
    console.log(`🔍 [EMPRESA AUTH] Token: ${token ? 'presente' : 'ausente'}`);

    if (!token) {
      console.log(`❌ [EMPRESA AUTH] Token de acesso não fornecido`);
      res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
      return;
    }

    // Verificar token
    console.log(`🔍 [EMPRESA AUTH] Verificando token JWT`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'teleup_secret') as any;
    console.log(`✅ [EMPRESA AUTH] Token JWT válido - Tipo: ${decoded.tipo}, Empresa ID: ${decoded.empresaId}`);

    if (decoded.tipo !== 'empresa') {
      console.log(`❌ [EMPRESA AUTH] Token não é para empresa - Tipo: ${decoded.tipo}`);
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Token inválido para empresa.'
      });
      return;
    }

    // Verificar se a sessão ainda está ativa
    console.log(`🔍 [EMPRESA AUTH] Verificando sessão no banco de dados para empresa ID: ${decoded.empresaId}`);
    const [sessoes] = await pool.execute(
      'SELECT * FROM sessoes_empresa WHERE empresa_id = $1 AND token = $2 AND ativo = TRUE AND expiracao > NOW()',
      [decoded.empresaId, token]
    );

    console.log(`📊 [EMPRESA AUTH] Sessões encontradas: ${(sessoes as any[]).length}`);

    if ((sessoes as any[]).length === 0) {
      console.log(`❌ [EMPRESA AUTH] Sessão expirada ou inválida para empresa ID: ${decoded.empresaId}`);
      res.status(401).json({
        success: false,
        message: 'Sessão expirada ou inválida'
      });
      return;
    }

    // Buscar dados da empresa
    console.log(`🔍 [EMPRESA AUTH] Buscando dados da empresa ID: ${decoded.empresaId}`);
    const [empresas] = await pool.execute(
      'SELECT id, nome, email, status, data_ultimo_login FROM empresas WHERE id = $1 AND status = $2',
      [decoded.empresaId, 'Ativo']
    );

    console.log(`📊 [EMPRESA AUTH] Empresas encontradas: ${(empresas as any[]).length}`);

    const empresa = (empresas as any[])[0];

    if (!empresa) {
      console.log(`❌ [EMPRESA AUTH] Empresa não encontrada ou inativa - ID: ${decoded.empresaId}`);
      res.status(401).json({
        success: false,
        message: 'Empresa não encontrada ou inativa'
      });
      return;
    }

    console.log(`✅ [EMPRESA AUTH] Empresa encontrada - ID: ${empresa.id}, Nome: ${empresa.nome}, Status: ${empresa.status}`);

    // Adicionar dados da empresa ao request
    req.empresa = empresa;
    req.token = token;

    console.log(`🎉 [EMPRESA AUTH] Autenticação de empresa bem-sucedida - ID: ${empresa.id}`);
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
