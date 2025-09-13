"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOnline = exports.requireGestor = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token de acesso necessário'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui');
        const [sessions] = await database_1.pool.execute('SELECT * FROM sessoes WHERE operador_id = ? AND token = ? AND ativo = TRUE AND expiracao > NOW()', [decoded.operadorId, token]);
        if (sessions.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Sessão expirada ou inválida'
            });
            return;
        }
        const [operadores] = await database_1.pool.execute('SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status FROM operadores WHERE id = ?', [decoded.operadorId]);
        if (operadores.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        req.operador = operadores[0];
        req.token = token;
        next();
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(403).json({
            success: false,
            message: 'Token inválido'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireGestor = (req, res, next) => {
    if (req.operador.nivel < 10) {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Nível de gestor necessário.'
        });
        return;
    }
    next();
};
exports.requireGestor = requireGestor;
const requireOnline = (req, res, next) => {
    if (req.operador.status === 'Offline') {
        res.status(403).json({
            success: false,
            message: 'Operador deve estar online para esta ação'
        });
        return;
    }
    next();
};
exports.requireOnline = requireOnline;
//# sourceMappingURL=auth.js.map