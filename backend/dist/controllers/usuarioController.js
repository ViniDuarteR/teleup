"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redefinirSenha = exports.excluirUsuario = exports.atualizarUsuario = exports.criarUsuario = exports.listarUsuarios = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const listarUsuarios = async (req, res) => {
    try {
        if (req.operador.tipo === 'gestor') {
            const [operadores] = await database_1.pool.execute(`SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, 
                status, avatar, tempo_online, data_criacao, data_atualizacao, pa, carteira
         FROM operadores 
         ORDER BY pontos_totais DESC`);
            res.json({
                success: true,
                data: operadores
            });
            return;
        }
        const operadorId = req.operador.id;
        const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM operadores WHERE id = ?', [operadorId]);
        const empresa = empresaResult;
        if (empresa.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const empresaId = empresa[0].empresa_id;
        const [operadores] = await database_1.pool.execute(`SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, 
              status, avatar, tempo_online, data_criacao, data_atualizacao, pa, carteira
       FROM operadores 
       WHERE empresa_id = ? 
       ORDER BY pontos_totais DESC`, [empresaId]);
        res.json({
            success: true,
            data: operadores
        });
    }
    catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listarUsuarios = listarUsuarios;
const criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, nivel = 1, pa = '', carteira = '' } = req.body;
        let empresaId = 1;
        if (req.operador.tipo === 'operador') {
            const operadorId = req.operador.id;
            const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM operadores WHERE id = ?', [operadorId]);
            const empresa = empresaResult;
            if (empresa.length > 0) {
                empresaId = empresa[0].empresa_id;
            }
        }
        const [emailExists] = await database_1.pool.execute('SELECT id FROM operadores WHERE email = ? AND empresa_id = ?', [email, empresaId]);
        if (emailExists.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Email já cadastrado nesta empresa'
            });
            return;
        }
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const xpProximoNivel = nivel * 100;
        const [result] = await database_1.pool.execute(`INSERT INTO operadores (nome, email, senha, nivel, xp_atual, xp_proximo_nivel, 
                              pontos_totais, status, avatar, tempo_online, empresa_id, pa, carteira)
       VALUES (?, ?, ?, ?, 0, ?, 0, 'Aguardando Chamada', 'avatar1.png', 0, ?, ?, ?)`, [nome, email, senhaHash, nivel, xpProximoNivel, empresaId, pa, carteira]);
        const insertResult = result;
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: { id: insertResult.insertId }
        });
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.criarUsuario = criarUsuario;
const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, nivel, status } = req.body;
        const operadorId = req.operador.id;
        const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM operadores WHERE id = ?', [operadorId]);
        const empresa = empresaResult;
        if (empresa.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const empresaId = empresa[0].empresa_id;
        const [usuarioResult] = await database_1.pool.execute('SELECT id FROM operadores WHERE id = ? AND empresa_id = ?', [id, empresaId]);
        if (usuarioResult.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
            return;
        }
        if (email) {
            const [emailExists] = await database_1.pool.execute('SELECT id FROM operadores WHERE email = ? AND empresa_id = ? AND id != ?', [email, empresaId, id]);
            if (emailExists.length > 0) {
                res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado nesta empresa'
                });
                return;
            }
        }
        const updateFields = [];
        const updateValues = [];
        if (nome) {
            updateFields.push('nome = ?');
            updateValues.push(nome);
        }
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (nivel) {
            updateFields.push('nivel = ?');
            updateFields.push('xp_proximo_nivel = ?');
            updateValues.push(nivel, nivel * 100);
        }
        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (updateFields.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Nenhum campo para atualizar'
            });
            return;
        }
        updateFields.push('data_atualizacao = CURRENT_TIMESTAMP');
        updateValues.push(id);
        await database_1.pool.execute(`UPDATE operadores SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.atualizarUsuario = atualizarUsuario;
const excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const operadorId = req.operador.id;
        if (parseInt(id) === operadorId) {
            res.status(400).json({
                success: false,
                message: 'Não é possível excluir seu próprio usuário'
            });
            return;
        }
        const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM operadores WHERE id = ?', [operadorId]);
        const empresa = empresaResult;
        if (empresa.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const empresaId = empresa[0].empresa_id;
        const [usuarioResult] = await database_1.pool.execute('SELECT id FROM operadores WHERE id = ? AND empresa_id = ?', [id, empresaId]);
        if (usuarioResult.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
            return;
        }
        await database_1.pool.execute('DELETE FROM operadores WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Usuário excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.excluirUsuario = excluirUsuario;
const redefinirSenha = async (req, res) => {
    try {
        const { id } = req.params;
        const { novaSenha } = req.body;
        const operadorId = req.operador.id;
        const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM operadores WHERE id = ?', [operadorId]);
        const empresa = empresaResult;
        if (empresa.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const empresaId = empresa[0].empresa_id;
        const [usuarioResult] = await database_1.pool.execute('SELECT id FROM operadores WHERE id = ? AND empresa_id = ?', [id, empresaId]);
        if (usuarioResult.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
            return;
        }
        const senhaHash = await bcryptjs_1.default.hash(novaSenha, 10);
        await database_1.pool.execute('UPDATE operadores SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', [senhaHash, id]);
        res.json({
            success: true,
            message: 'Senha redefinida com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.redefinirSenha = redefinirSenha;
//# sourceMappingURL=usuarioController.js.map