"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comprarRecompensa = exports.getCompras = exports.getRecompensas = void 0;
const recompensasMock = [
    {
        id: 1,
        nome: "Café Premium",
        descricao: "Um café especial para energizar seu dia de trabalho",
        categoria: "Itens",
        preco: 50,
        tipo: "item",
        raridade: "comum",
        imagem: null,
        disponivel: true,
        quantidade_restante: 100
    },
    {
        id: 2,
        nome: "Almoço Grátis",
        descricao: "Vale-refeição para o restaurante da empresa",
        categoria: "Itens",
        preco: 200,
        tipo: "item",
        raridade: "raro",
        imagem: null,
        disponivel: true,
        quantidade_restante: 50
    },
    {
        id: 3,
        nome: "Pausa Extra",
        descricao: "15 minutos de pausa adicional no dia",
        categoria: "Benefícios",
        preco: 100,
        tipo: "beneficio",
        raridade: "comum",
        imagem: null,
        disponivel: true,
        quantidade_restante: null
    },
    {
        id: 4,
        nome: "Operador Estrela",
        descricao: "Título exclusivo para operadores de destaque",
        categoria: "Títulos",
        preco: 1000,
        tipo: "titulo",
        raridade: "raro",
        imagem: null,
        disponivel: true,
        quantidade_restante: null
    },
    {
        id: 5,
        nome: "Avatar Dourado",
        descricao: "Avatar especial com efeito dourado",
        categoria: "Avatares",
        preco: 300,
        tipo: "avatar",
        raridade: "raro",
        imagem: null,
        disponivel: true,
        quantidade_restante: null
    }
];
const getRecompensas = async (req, res) => {
    try {
        return res.json({
            success: true,
            data: recompensasMock
        });
    }
    catch (error) {
        console.error('Erro ao buscar recompensas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getRecompensas = getRecompensas;
const getCompras = async (req, res) => {
    try {
        return res.json({
            success: true,
            data: []
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
    try {
        const { recompensa_id } = req.body;
        const operadorId = req.user?.id;
        if (!operadorId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        const recompensa = recompensasMock.find(r => r.id === recompensa_id);
        if (!recompensa) {
            return res.status(404).json({
                success: false,
                message: 'Recompensa não encontrada'
            });
        }
        return res.json({
            success: true,
            message: 'Compra realizada com sucesso!',
            data: {
                compra_id: Math.floor(Math.random() * 1000),
                pontos_gastos: recompensa.preco,
                pontos_restantes: 1000 - recompensa.preco
            }
        });
    }
    catch (error) {
        console.error('Erro ao comprar recompensa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.comprarRecompensa = comprarRecompensa;
//# sourceMappingURL=lojaController.js.map