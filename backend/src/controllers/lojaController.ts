import { Response } from 'express';
import { AuthRequest } from '../types';

// Dados mockados para teste
let recompensasMock = [
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

let nextId = 6;

// Buscar recompensas
export const getRecompensas = async (req: AuthRequest, res: Response) => {
  try {
    return res.json({
      success: true,
      data: recompensasMock
    });
  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar compras do operador
export const getCompras = async (req: AuthRequest, res: Response) => {
  try {
    // Mock de compras vazias por enquanto
    return res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Comprar recompensa
export const comprarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const { recompensa_id } = req.body;
    const operadorId = req.user?.id;
    
    if (!operadorId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar recompensa
    const recompensa = recompensasMock.find(r => r.id === recompensa_id);
    
    if (!recompensa) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    // Simular compra bem-sucedida
    return res.json({
      success: true,
      message: 'Compra realizada com sucesso!',
      data: {
        compra_id: Math.floor(Math.random() * 1000),
        pontos_gastos: recompensa.preco,
        pontos_restantes: 1000 - recompensa.preco // Mock
      }
    });
    
  } catch (error) {
    console.error('Erro ao comprar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova recompensa
export const criarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const {
      nome,
      descricao,
      categoria,
      preco,
      tipo,
      raridade,
      imagem,
      disponivel,
      quantidade_restante
    } = req.body;

    const novaRecompensa = {
      id: nextId++,
      nome,
      descricao,
      categoria,
      preco: parseInt(preco),
      tipo,
      raridade,
      imagem: imagem || null,
      disponivel: disponivel !== false,
      quantidade_restante: quantidade_restante ? parseInt(quantidade_restante) : null
    };

    recompensasMock.push(novaRecompensa);

    return res.json({
      success: true,
      message: 'Recompensa criada com sucesso!',
      data: novaRecompensa
    });
  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar recompensa
export const atualizarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      categoria,
      preco,
      tipo,
      raridade,
      imagem,
      disponivel,
      quantidade_restante
    } = req.body;

    const index = recompensasMock.findIndex(r => r.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    recompensasMock[index] = {
      ...recompensasMock[index],
      nome,
      descricao,
      categoria,
      preco: parseInt(preco),
      tipo,
      raridade,
      imagem: imagem || null,
      disponivel: disponivel !== false,
      quantidade_restante: quantidade_restante ? parseInt(quantidade_restante) : null
    };

    return res.json({
      success: true,
      message: 'Recompensa atualizada com sucesso!',
      data: recompensasMock[index]
    });
  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir recompensa
export const excluirRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const index = recompensasMock.findIndex(r => r.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    recompensasMock.splice(index, 1);

    return res.json({
      success: true,
      message: 'Recompensa excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Toggle disponibilidade
export const toggleDisponibilidade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { disponivel } = req.body;
    
    const index = recompensasMock.findIndex(r => r.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    recompensasMock[index].disponivel = disponivel;

    return res.json({
      success: true,
      message: `Recompensa ${disponivel ? 'habilitada' : 'desabilitada'} com sucesso!`,
      data: recompensasMock[index]
    });
  } catch (error) {
    console.error('Erro ao alterar disponibilidade:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
