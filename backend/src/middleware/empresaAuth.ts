import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Empresa, Sessao } from '../models';
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
    const empresaId = new mongoose.Types.ObjectId(decoded.empresaId);
    const sessao = await Sessao.findOne({
      empresa_id: empresaId,
      token,
      ativo: true,
      expiracao: { $gt: new Date() }
    });

    if (!sessao) {
      res.status(401).json({
        success: false,
        message: 'Sessão expirada ou inválida'
      });
      return;
    }

    // Buscar dados da empresa
    const empresa = await Empresa.findOne({
      _id: empresaId,
      status: 'Ativo'
    });

    if (!empresa) {
      res.status(401).json({
        success: false,
        message: 'Empresa não encontrada ou inativa'
      });
      return;
    }

    // Adicionar dados da empresa ao request
    req.empresa = {
      id: empresa._id.toString(),
      nome: empresa.nome,
      email: empresa.email,
      status: empresa.status,
      data_ultimo_login: empresa.data_ultimo_login
    };
    req.token = token;

    next();
  } catch (error: any) {
    console.error(`❌ [EMPRESA AUTH] Erro na autenticação da empresa:`, error);
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
