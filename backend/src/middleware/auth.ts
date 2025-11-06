import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Gestor, Operador } from '../models';
import { AuthRequest } from '../types';

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
    
    // Verificar se é gestor ou operador
    if (decoded.tipo === 'gestor') {
      const gestorId = new mongoose.Types.ObjectId(decoded.gestorId);
      const gestor = await Gestor.findOne({ _id: gestorId, status: 'Ativo' });

      if (!gestor) {
        res.status(401).json({ 
          success: false, 
          message: 'Gestor não encontrado' 
        });
        return;
      }
      
      req.operador = {
        id: gestor._id.toString(),
        nome: gestor.nome,
        email: gestor.email,
        tipo: 'gestor',
        status: gestor.status
      } as any;
      req.user = {
        id: gestor._id.toString(),
        email: gestor.email,
        tipo: 'gestor'
      };
    } else {
      const operadorId = new mongoose.Types.ObjectId(decoded.operadorId);
      const operador = await Operador.findById(operadorId);

      if (!operador) {
        res.status(401).json({ 
          success: false, 
          message: 'Operador não encontrado' 
        });
        return;
      }
      
      req.operador = {
        id: operador._id.toString(),
        nome: operador.nome,
        email: operador.email,
        tipo: 'operador',
        nivel: operador.nivel,
        pontos_totais: operador.pontos_totais,
        status: operador.status,
        status_operacional: operador.status_operacional,
        xp_atual: operador.xp,
        xp_proximo_nivel: operador.nivel * 100,
        tempo_online: operador.tempo_online,
        avatar: operador.avatar,
        data_criacao: operador.data_criacao,
        data_atualizacao: operador.data_atualizacao
      } as any;
      req.user = {
        id: operador._id.toString(),
        email: operador.email,
        tipo: 'operador'
      };
    }
    
    req.token = token;
    next();
  } catch (error: any) {
    console.error(`❌ [AUTH MIDDLEWARE] Erro na autenticação para ${req.method} ${req.path}:`, error);
    
    if (error?.name === 'JsonWebTokenError') {
      res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
      return;
    }
    
    if (error?.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
      return;
    }
    
    res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Middleware para verificar se é gestor
export const requireGestor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.operador?.tipo !== 'gestor') {
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
  if (req.operador?.status_operacional === 'Offline') {
    res.status(403).json({ 
      success: false, 
      message: 'Operador deve estar online para esta ação' 
    });
    return;
  }
  next();
};
