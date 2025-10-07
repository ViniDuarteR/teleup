"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmpresa = exports.authenticateEmpresa = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticateEmpresa = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'teleup_secret');
        if (decoded.tipo !== 'empresa') {
            res.status(403).json({
                success: false,
                message: 'Acesso negado. Token inválido para empresa.'
            });
            return;
        }
        const [sessoes] = await database_1.pool.execute('SELECT * FROM sessoes_empresa WHERE empresa_id = ? AND token = ? AND ativo = TRUE AND expiracao > NOW()', [decoded.empresaId, token]);
        if (sessoes.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Sessão expirada ou inválida'
            });
            return;
        }
        const [empresas] = await database_1.pool.execute('SELECT id, nome, email, status, data_ultimo_login FROM empresas WHERE id = ? AND status = "Ativo"', [decoded.empresaId]);
        const empresa = empresas[0];
        if (!empresa) {
            res.status(401).json({
                success: false,
                message: 'Empresa não encontrada ou inativa'
            });
            return;
        }
        req.empresa = empresa;
        req.token = token;
        next();
    }
    catch (error) {
        console.error('Erro na autenticação da empresa:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};
exports.authenticateEmpresa = authenticateEmpresa;
const requireEmpresa = (req, res, next) => {
    if (!req.empresa) {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Empresa não autenticada.'
        });
        return;
    }
    next();
};
exports.requireEmpresa = requireEmpresa;
//# sourceMappingURL=empresaAuth.js.map