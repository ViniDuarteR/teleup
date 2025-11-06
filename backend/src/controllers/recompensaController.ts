import { Response } from 'express';
import mongoose from 'mongoose';
import { Recompensa, Compra, Operador, Gestor } from '../models';
import { AuthRequest } from '../types';

export const getRecompensas = async (req: AuthRequest, res: Response) => {
  try {
    let empresaId: mongoose.Types.ObjectId | null = null;
    
    if (req.user?.tipo === 'gestor') {
      const gestorId = new mongoose.Types.ObjectId(req.user.id);
      const gestor = await Gestor.findById(gestorId);
      if (gestor) empresaId = gestor.empresa_id;
    } else if (req.user?.tipo === 'operador') {
      const operadorId = new mongoose.Types.ObjectId(req.user.id);
      const operador = await Operador.findById(operadorId);
      if (operador) empresaId = operador.empresa_id;
    }

    const query: any = { disponivel: true };
    if (empresaId) {
      query.empresa_id = empresaId;
    }

    const recompensas = await Recompensa.find(query)
      .sort({ raridade: -1, preco: 1 });

    res.json({
      success: true,
      data: recompensas.map(r => ({
        id: r._id.toString(),
        nome: r.titulo,
        descricao: r.descricao,
        categoria: r.categoria,
        preco: r.preco,
        tipo: r.tipo,
        raridade: r.raridade,
        imagem: r.imagem,
        disponivel: r.disponivel,
        quantidade_restante: r.quantidade_restante,
        data_criacao: r.criado_em
      }))
    });
  } catch (error) {
    console.error('❌ [GET RECOMPENSAS] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getCompras = async (req: AuthRequest, res: Response) => {
  try {
    const operadorId = new mongoose.Types.ObjectId(req.user?.id || '');

    const compras = await Compra.find({ operador_id: operadorId })
      .populate('recompensa_id', 'titulo categoria preco')
      .sort({ data_compra: -1 });

    res.json({
      success: true,
      data: compras.map(c => ({
        id: c._id.toString(),
        recompensa_id: c.recompensa_id.toString(),
        operador_id: c.operador_id.toString(),
        data_compra: c.data_compra,
        status: c.status,
        recompensa_nome: (c.recompensa_id as any)?.titulo,
        categoria: (c.recompensa_id as any)?.categoria,
        preco: (c.recompensa_id as any)?.preco
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const comprarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const operadorId = new mongoose.Types.ObjectId(req.user?.id || '');
    const { recompensa_id } = req.body;

    const recompensa = await Recompensa.findById(recompensa_id);
    if (!recompensa || !recompensa.disponivel) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada ou indisponível'
      });
    }

    const compraExistente = await Compra.findOne({ operador_id: operadorId, recompensa_id });
    if (compraExistente) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta recompensa'
      });
    }

    const operador = await Operador.findById(operadorId);
    if (!operador) {
      return res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
    }

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

    const compra = await Compra.create({
      operador_id: operadorId,
      recompensa_id,
      preco_pago: recompensa.preco,
      status: 'aprovada',
      data_compra: new Date()
    });

    await Operador.updateOne(
      { _id: operadorId },
      { $inc: { pontos_totais: -recompensa.preco } }
    );

    if (recompensa.quantidade_restante !== null) {
      await Recompensa.updateOne(
        { _id: recompensa_id },
        { $inc: { quantidade_restante: -1 } }
      );
    }

    return res.json({
      success: true,
      message: 'Compra realizada com sucesso!',
      data: {
        compra_id: compra._id.toString(),
        pontos_gastos: recompensa.preco,
        pontos_restantes: operador.pontos_totais - recompensa.preco
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

export const criarRecompensa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nome, descricao, categoria, preco, tipo, raridade, imagem, quantidade_restante } = req.body;

    if (!nome || !preco) {
      res.status(400).json({
        success: false,
        message: 'Nome e preço são obrigatórios'
      });
      return;
    }

    const gestorId = new mongoose.Types.ObjectId(req.user?.id || '');
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Empresa do gestor não encontrada'
      });
      return;
    }

    let caminhoImagem = imagem || null;
    if (req.file) {
      caminhoImagem = req.file.filename;
    }

    const categoriasValidas = ['Produtos', 'Servicos', 'Vouchers', 'Outros'];
    const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'Outros';

    const recompensa = await Recompensa.create({
      titulo: nome,
      descricao,
      categoria: categoriaFinal,
      preco,
      tipo: tipo || 'item',
      raridade: raridade || 'comum',
      imagem: caminhoImagem,
      disponivel: true,
      quantidade_restante: quantidade_restante || null,
      empresa_id: gestor.empresa_id
    });

    res.json({
      success: true,
      message: 'Recompensa criada com sucesso!',
      data: { id: recompensa._id.toString() }
    });
  } catch (error: any) {
    console.error('❌ [CRIAR RECOMPENSA] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const atualizarRecompensa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, descricao, categoria, preco, tipo, raridade, imagem, quantidade_restante, disponivel } = req.body;

    const gestorId = new mongoose.Types.ObjectId(req.user?.id || '');
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Empresa do gestor não encontrada'
      });
      return;
    }

    const recompensa = await Recompensa.findOne({ _id: id, empresa_id: gestor.empresa_id });
    if (!recompensa) {
      res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
      return;
    }

    const updateData: any = {};
    if (nome !== undefined) updateData.titulo = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (categoria !== undefined) {
      const categoriasValidas = ['Produtos', 'Servicos', 'Vouchers', 'Outros'];
      updateData.categoria = categoriasValidas.includes(categoria) ? categoria : 'Outros';
    }
    if (preco !== undefined) updateData.preco = preco;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (raridade !== undefined) updateData.raridade = raridade;
    if (imagem !== undefined) updateData.imagem = imagem;
    if (quantidade_restante !== undefined) updateData.quantidade_restante = quantidade_restante;
    if (disponivel !== undefined) updateData.disponivel = disponivel;

    await Recompensa.updateOne({ _id: id }, updateData);

    res.json({
      success: true,
      message: 'Recompensa atualizada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const excluirRecompensa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gestorId = new mongoose.Types.ObjectId(req.user?.id || '');
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Empresa do gestor não encontrada'
      });
      return;
    }

    const recompensa = await Recompensa.findOne({ _id: id, empresa_id: gestor.empresa_id });
    if (!recompensa) {
      res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
      return;
    }

    await Recompensa.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Recompensa excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir recompensa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const toggleDisponibilidade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gestorId = new mongoose.Types.ObjectId(req.user?.id || '');
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      res.status(404).json({
        success: false,
        message: 'Empresa do gestor não encontrada'
      });
      return;
    }

    const recompensa = await Recompensa.findOne({ _id: id, empresa_id: gestor.empresa_id });
    if (!recompensa) {
      res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
      return;
    }

    await Recompensa.updateOne(
      { _id: id },
      { disponivel: !recompensa.disponivel }
    );

    res.json({
      success: true,
      message: `Recompensa ${!recompensa.disponivel ? 'disponibilizada' : 'indisponibilizada'} com sucesso!`,
      data: {
        disponivel: !recompensa.disponivel
      }
    });
  } catch (error) {
    console.error('Erro ao alterar disponibilidade da recompensa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
