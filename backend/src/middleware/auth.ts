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
    // Log reduzido para evitar alertas de segurança
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
    
    // Verificar se a sessão ainda está ativa no banco (opcional para produção)
    try {
      let sessions: any[] = [];
      
      if (decoded.tipo === 'gestor') {
        // Para gestores, verificar sessoes_empresa
        const [empresaSessions] = await pool.execute(
          'SELECT * FROM sessoes_empresa WHERE empresa_id = (SELECT empresa_id FROM gestores WHERE id = $1) AND token = $2 AND ativo = TRUE AND expiracao > NOW()',
          [decoded.gestorId, token]
        );
        sessions = empresaSessions as any[];
      } else {
        // Para operadores, verificar sessoes
        const [operadorSessions] = await pool.execute(
          'SELECT * FROM sessoes WHERE operador_id = $1 AND token = $2 AND ativo = TRUE AND expiracao > NOW()',
          [decoded.operadorId, token]
        );
        sessions = operadorSessions as any[];
      }
    } catch (error: any) {
      // Continuar mesmo se falhar ao verificar sessão
    }

    // Verificar se é gestor ou operador
    if (decoded.tipo === 'gestor') {
      // Buscar dados do gestor
      const [gestores] = await pool.execute(
        'SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE id = $1 AND status = $2',
        [decoded.gestorId, 'Ativo']
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
      // Buscando dados do operador
      // Buscar dados do operador
      const [operadores] = await pool.execute(
        'SELECT id, nome, email, nivel, xp, pontos_totais, status, avatar, tempo_online, data_criacao, data_atualizacao FROM operadores WHERE id = $1',
        [decoded.operadorId]
      );

      // Operadores encontrados

      if ((operadores as Operador[]).length === 0) {
        // Operador não encontrado
        res.status(401).json({ 
          success: false, 
          message: 'Operador não encontrado' 
        });
        return;
      }

      const operador = (operadores as Operador[])[0];
      // Operador encontrado
      
      req.operador = operador;
      req.user = {
        id: operador.id,
        email: operador.email,
        tipo: 'operador'
      };
    }
    
    req.token = token;
    // Autenticação bem-sucedida
    next();
  } catch (error: any) {
    console.error(`❌ [AUTH MIDDLEWARE] Erro na autenticação para ${req.method} ${req.path}:`, error);
    console.error(`❌ [AUTH MIDDLEWARE] Stack trace:`, error.stack);
    
    // Verificar se é erro de conexão com banco
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      console.log(`❌ [AUTH MIDDLEWARE] Erro de conexão com banco de dados`);
      res.status(500).json({
        success: false,
        message: 'Erro de conexão com banco de dados'
      });
      return;
    }
    
    // Verificar se é erro de JWT
    if (error?.name === 'JsonWebTokenError') {
      console.log(`❌ [AUTH MIDDLEWARE] Token JWT inválido`);
      res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
      return;
    }
    
    if (error?.name === 'TokenExpiredError') {
      console.log(`❌ [AUTH MIDDLEWARE] Token JWT expirado`);
      res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
      return;
    }
    
    console.log(`❌ [AUTH MIDDLEWARE] Erro geral de autenticação`);
    res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Middleware para verificar se é gestor
export const requireGestor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  console.log('🔍 [REQUIRE GESTOR] Verificando permissão de gestor');
  console.log('🔍 [REQUIRE GESTOR] req.operador:', req.operador);
  console.log('🔍 [REQUIRE GESTOR] Tipo do usuário:', req.operador?.tipo);
  
  if (req.operador?.tipo !== 'gestor') {
    console.log('❌ [REQUIRE GESTOR] Acesso negado - não é gestor');
    res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Permissão de gestor necessária.' 
    });
    return;
  }
  
  console.log('✅ [REQUIRE GESTOR] Permissão de gestor confirmada');
  next();
};

// Middleware para verificar se operador está online
export const requireOnline = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.operador.status_operacional === 'Offline') {
    res.status(403).json({ 
      success: false, 
      message: 'Operador deve estar online para esta ação' 
    });
    return;
  }
  next();
};
