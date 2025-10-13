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
    console.log(`🔐 [AUTH MIDDLEWARE] Iniciando autenticação para ${req.method} ${req.path}`);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log(`🔍 [AUTH MIDDLEWARE] Authorization header: ${authHeader ? 'presente' : 'ausente'}`);
    console.log(`🔍 [AUTH MIDDLEWARE] Token: ${token ? 'presente' : 'ausente'}`);

    if (!token) {
      console.log(`❌ [AUTH MIDDLEWARE] Token de acesso não fornecido`);
      res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      });
      return;
    }

    console.log(`🔍 [AUTH MIDDLEWARE] Verificando token JWT`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui') as any;
    console.log(`✅ [AUTH MIDDLEWARE] Token JWT válido - Tipo: ${decoded.tipo}, ID: ${decoded.operadorId || decoded.gestorId}`);
    
    // Verificar se a sessão ainda está ativa no banco (opcional para produção)
    try {
      console.log(`🔍 [AUTH MIDDLEWARE] Verificando sessão no banco de dados`);
      let sessions: any[] = [];
      
      if (decoded.tipo === 'gestor') {
        console.log(`🔍 [AUTH MIDDLEWARE] Verificando sessão de gestor na tabela sessoes_empresa`);
        // Para gestores, verificar sessoes_empresa
        const [empresaSessions] = await pool.execute(
          'SELECT * FROM sessoes_empresa WHERE empresa_id = (SELECT empresa_id FROM gestores WHERE id = $1) AND token = $2 AND ativo = TRUE AND expiracao > NOW()',
          [decoded.gestorId, token]
        );
        sessions = empresaSessions as any[];
        console.log(`📊 [AUTH MIDDLEWARE] Sessões de empresa encontradas: ${sessions.length}`);
      } else {
        console.log(`🔍 [AUTH MIDDLEWARE] Verificando sessão de operador na tabela sessoes`);
        // Para operadores, verificar sessoes
        const [operadorSessions] = await pool.execute(
          'SELECT * FROM sessoes WHERE operador_id = $1 AND token = $2 AND ativo = TRUE AND expiracao > NOW()',
          [decoded.operadorId, token]
        );
        sessions = operadorSessions as any[];
        console.log(`📊 [AUTH MIDDLEWARE] Sessões de operador encontradas: ${sessions.length}`);
      }

      // Se não encontrar sessão, continuar mesmo assim (para compatibilidade)
      if (sessions.length === 0) {
        console.log(`⚠️ [AUTH MIDDLEWARE] Sessão não encontrada no banco, mas continuando autenticação...`);
      } else {
        console.log(`✅ [AUTH MIDDLEWARE] Sessão encontrada no banco e ativa`);
      }
    } catch (error: any) {
      console.log(`⚠️ [AUTH MIDDLEWARE] Erro ao verificar sessão, continuando autenticação: ${error.message}`);
      console.log(`⚠️ [AUTH MIDDLEWARE] Stack trace:`, error.stack);
      // Continuar mesmo se falhar ao verificar sessão
    }

    // Verificar se é gestor ou operador
    if (decoded.tipo === 'gestor') {
      console.log(`🔍 [AUTH MIDDLEWARE] Buscando dados do gestor ID: ${decoded.gestorId}`);
      // Buscar dados do gestor
      const [gestores] = await pool.execute(
        'SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE id = $1 AND status = $2',
        [decoded.gestorId, 'Ativo']
      );

      console.log(`📊 [AUTH MIDDLEWARE] Gestores encontrados: ${(gestores as any[]).length}`);

      if ((gestores as any[]).length === 0) {
        console.log(`❌ [AUTH MIDDLEWARE] Gestor não encontrado ou inativo - ID: ${decoded.gestorId}`);
        res.status(401).json({ 
          success: false, 
          message: 'Gestor não encontrado' 
        });
        return;
      }

      const gestor = (gestores as any[])[0];
      console.log(`✅ [AUTH MIDDLEWARE] Gestor encontrado - ID: ${gestor.id}, Nome: ${gestor.nome}, Status: ${gestor.status}`);
      
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
      console.log(`🔍 [AUTH MIDDLEWARE] Buscando dados do operador ID: ${decoded.operadorId}`);
      // Buscar dados do operador
      const [operadores] = await pool.execute(
        'SELECT id, nome, email, nivel, xp, pontos_totais, status, avatar, tempo_online, data_criacao, data_atualizacao FROM operadores WHERE id = $1',
        [decoded.operadorId]
      );

      console.log(`📊 [AUTH MIDDLEWARE] Operadores encontrados: ${(operadores as Operador[]).length}`);

      if ((operadores as Operador[]).length === 0) {
        console.log(`❌ [AUTH MIDDLEWARE] Operador não encontrado - ID: ${decoded.operadorId}`);
        res.status(401).json({ 
          success: false, 
          message: 'Operador não encontrado' 
        });
        return;
      }

      const operador = (operadores as Operador[])[0];
      console.log(`✅ [AUTH MIDDLEWARE] Operador encontrado - ID: ${operador.id}, Nome: ${operador.nome}, Status: ${operador.status}`);
      
      req.operador = operador;
      req.user = {
        id: operador.id,
        email: operador.email,
        tipo: 'operador'
      };
    }
    
    req.token = token;
    console.log(`🎉 [AUTH MIDDLEWARE] Autenticação bem-sucedida para ${req.user?.tipo} - ID: ${req.user?.id}`);
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
