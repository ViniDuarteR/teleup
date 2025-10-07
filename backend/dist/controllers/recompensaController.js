"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarRecompensa = exports.comprarRecompensa = exports.getCompras = exports.getRecompensas = void 0;
const database_1 = require("../config/database");
const getRecompensas = async (req, res) => {
    try {
        const query = `
      SELECT 
        id,
        nome,
        descricao,
        categoria,
        preco,
        tipo,
        raridade,
        imagem,
        disponivel,
        quantidade_restante,
        data_criacao
      FROM recompensas 
      WHERE disponivel = true
      ORDER BY raridade DESC, preco ASC
    `;
        const [rows] = await database_1.pool.execute(query);
        res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error('Erro ao buscar recompensas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getRecompensas = getRecompensas;
const getCompras = async (req, res) => {
    try {
        const operadorId = req.user?.id;
        if (!operadorId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        const query = `
      SELECT 
        c.id,
        c.recompensa_id,
        c.operador_id,
        c.data_compra,
        c.status,
        r.nome as recompensa_nome,
        r.categoria,
        r.preco
      FROM compras c
      JOIN recompensas r ON c.recompensa_id = r.id
      WHERE c.operador_id = ?
      ORDER BY c.data_compra DESC
    `;
        const [rows] = await database_1.pool.execute(query, [operadorId]);
        return res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error('Erro ao buscar compras:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getCompras = getCompras;
const comprarRecompensa = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        await connection.beginTransaction();
        const operadorId = req.user?.id;
        const { recompensa_id } = req.body;
        if (!operadorId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        const [recompensaRows] = await connection.execute('SELECT * FROM recompensas WHERE id = ? AND disponivel = true', [recompensa_id]);
        if (!Array.isArray(recompensaRows) || recompensaRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recompensa não encontrada ou indisponível'
            });
        }
        const recompensa = recompensaRows[0];
        const [compraExistente] = await connection.execute('SELECT id FROM compras WHERE operador_id = ? AND recompensa_id = ?', [operadorId, recompensa_id]);
        if (Array.isArray(compraExistente) && compraExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Você já possui esta recompensa'
            });
        }
        const [operadorRows] = await connection.execute('SELECT pontos_totais FROM operadores WHERE id = ?', [operadorId]);
        if (!Array.isArray(operadorRows) || operadorRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
        }
        const operador = operadorRows[0];
        if (operador.pontos_totais < recompensa.preco) {
            return res.status(400).json({
                success: false,
                message: 'Pontos insuficientes para comprar esta recompensa'
            });
        }
        if (recompensa.quantidade_restante !== null && recompensa.quantidade_restante <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Recompensa esgotada'
            });
        }
        const [result] = await connection.execute('INSERT INTO compras (operador_id, recompensa_id, data_compra, status) VALUES (?, ?, NOW(), "aprovada")', [operadorId, recompensa_id]);
        await connection.execute('UPDATE operadores SET pontos_totais = pontos_totais - ? WHERE id = ?', [recompensa.preco, operadorId]);
        if (recompensa.quantidade_restante !== null) {
            await connection.execute('UPDATE recompensas SET quantidade_restante = quantidade_restante - 1 WHERE id = ?', [recompensa_id]);
        }
        await connection.commit();
        return res.json({
            success: true,
            message: 'Compra realizada com sucesso!',
            data: {
                compra_id: result.insertId,
                pontos_gastos: recompensa.preco,
                pontos_restantes: operador.pontos_totais - recompensa.preco
            }
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('Erro ao comprar recompensa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
    finally {
        connection.release();
    }
};
exports.comprarRecompensa = comprarRecompensa;
const criarRecompensa = async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, tipo, raridade, imagem, quantidade_restante } = req.body;
        const query = `
      INSERT INTO recompensas (
        nome, descricao, categoria, preco, tipo, raridade, 
        imagem, disponivel, quantidade_restante, data_criacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, NOW())
    `;
        const [result] = await database_1.pool.execute(query, [
            nome, descricao, categoria, preco, tipo, raridade,
            imagem, quantidade_restante
        ]);
        res.json({
            success: true,
            message: 'Recompensa criada com sucesso!',
            data: {
                id: result.insertId
            }
        });
    }
    catch (error) {
        console.error('Erro ao criar recompensa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.criarRecompensa = criarRecompensa;
//# sourceMappingURL=recompensaController.js.map