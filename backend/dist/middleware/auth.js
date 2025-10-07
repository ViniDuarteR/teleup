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
        let sessions = [];
        if (decoded.tipo === 'gestor') {
            const [empresaSessions] = await database_1.pool.execute('SELECT * FROM sessoes_empresa WHERE empresa_id = (SELECT empresa_id FROM gestores WHERE id = ?) AND token = ? AND ativo = TRUE AND expiracao > NOW()', [decoded.gestorId, token]);
            sessions = empresaSessions;
        }
        else {
            const [operadorSessions] = await database_1.pool.execute('SELECT * FROM sessoes WHERE operador_id = ? AND token = ? AND ativo = TRUE AND expiracao > NOW()', [decoded.operadorId, token]);
            sessions = operadorSessions;
        }
        if (sessions.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Sessão expirada ou inválida'
            });
            return;
        }
        if (decoded.tipo === 'gestor') {
            const [gestores] = await database_1.pool.execute('SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE id = ? AND status = "Ativo"', [decoded.gestorId]);
            if (gestores.length === 0) {
                res.status(401).json({
                    success: false,
                    message: 'Gestor não encontrado'
                });
                return;
            }
            const gestor = gestores[0];
            req.operador = {
                id: gestor.id,
                nome: gestor.nome,
                email: gestor.email,
                tipo: 'gestor',
                status: gestor.status,
                avatar: gestor.avatar,
                data_criacao: gestor.data_criacao,
                data_atualizacao: gestor.data_atualizacao
            };
            req.user = {
                id: gestor.id,
                email: gestor.email,
                tipo: 'gestor'
            };
        }
        else {
            const [operadores] = await database_1.pool.execute('SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status, avatar, tempo_online, data_criacao, data_atualizacao FROM operadores WHERE id = ?', [decoded.operadorId]);
            if (operadores.length === 0) {
                res.status(401).json({
                    success: false,
                    message: 'Operador não encontrado'
                });
                return;
            }
            const operador = operadores[0];
            req.operador = operador;
            req.user = {
                id: operador.id,
                email: operador.email,
                tipo: 'operador'
            };
        }
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
    if (req.operador.tipo !== 'gestor') {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Permissão de gestor necessária.'
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