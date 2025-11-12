import { Response } from 'express';
import mongoose from 'mongoose';
import { Contato, Gestor, Operador } from '../models';
import { AuthRequest, ApiResponse } from '../types';

const CONTATOS_PADRAO = [
  {
    nome: 'Ana Souza',
    numero: '11987654321',
    empresa: 'Mercado São João',
    segmento: 'Varejo',
    observacao: 'Cliente ativo - nível ouro'
  },
  {
    nome: 'Marcos Lima',
    numero: '21981234567',
    empresa: 'TechPrime',
    segmento: 'Tecnologia',
    observacao: 'Aguardando proposta comercial'
  },
  {
    nome: 'Cláudia Ramos',
    numero: '31999887766',
    empresa: 'HealthCare Plus',
    segmento: 'Saúde',
    observacao: 'Solicitou demonstração do produto'
  },
  {
    nome: 'Eduardo Santos',
    numero: '41988776655',
    empresa: 'AutoMax',
    segmento: 'Automotivo',
    observacao: 'Retornar com opções de financiamento'
  },
  {
    nome: 'Fernanda Oliveira',
    numero: '51977665544',
    empresa: 'GreenFoods',
    segmento: 'Alimentos',
    observacao: 'Cliente novo – indicado pelo marketing'
  },
  {
    nome: 'João Pedro',
    numero: '71966554433',
    empresa: 'SolarUp',
    segmento: 'Energia',
    observacao: 'Interessado no plano premium'
  },
  {
    nome: 'Luciana Pereira',
    numero: '11999887711',
    empresa: 'Casa Verde',
    segmento: 'Construção',
    observacao: 'Solicitou catálogo atualizado'
  },
  {
    nome: 'Rafael Gomes',
    numero: '21988776644',
    empresa: 'FitNow',
    segmento: 'Saúde e Fitness',
    observacao: 'Interessado em plano corporativo'
  },
  {
    nome: 'Patrícia Nunes',
    numero: '31977666533',
    empresa: 'MegaTech',
    segmento: 'Tecnologia',
    observacao: 'Aguardando proposta de upgrade'
  },
  {
    nome: 'Carlos Alberto',
    numero: '41966554422',
    empresa: 'AutoFrota',
    segmento: 'Logística',
    observacao: 'Renovação de contrato em análise'
  },
  {
    nome: 'Juliana Batista',
    numero: '51955443322',
    empresa: 'EcoFoods',
    segmento: 'Alimentação',
    observacao: 'Aguardando visita técnica'
  },
  {
    nome: 'Marcelo Ribeiro',
    numero: '71944332211',
    empresa: 'EnergiaMais',
    segmento: 'Energia',
    observacao: 'Solicitou simulação de economia'
  }
];

const obterEmpresaId = async (req: AuthRequest): Promise<mongoose.Types.ObjectId | null> => {
  if (req.operador?.tipo === 'gestor') {
    const gestor = await Gestor.findById(req.operador.id).select('empresa_id');
    return gestor?.empresa_id || null;
  }

  const operador = await Operador.findById(req.operador?.id).select('empresa_id');
  return operador?.empresa_id || null;
};

export const listarContatosDiscador = async (
  req: AuthRequest,
  res: Response<ApiResponse<{ contatos: any[] }>>
): Promise<void> => {
  try {
    const empresaId = await obterEmpresaId(req);

    if (!empresaId) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada para o usuário autenticado'
      });
      return;
    }

    let contatos = await Contato.find({ empresa_id: empresaId }).sort({ nome: 1 });

    if (contatos.length === 0) {
      const contatosSeed = CONTATOS_PADRAO.map((contato) => ({
        ...contato,
        empresa_id: empresaId,
        origem: 'default'
      }));
      await Contato.insertMany(contatosSeed);
      contatos = await Contato.find({ empresa_id: empresaId }).sort({ nome: 1 });
    } else if (contatos.length < CONTATOS_PADRAO.length) {
      const numerosExistentes = new Set(contatos.map((contato) => contato.numero));
      const faltantes = CONTATOS_PADRAO.filter((contato) => !numerosExistentes.has(contato.numero));
      if (faltantes.length > 0) {
        await Contato.insertMany(
          faltantes.map((contato) => ({
            ...contato,
            empresa_id: empresaId,
            origem: 'default'
          }))
        );
        contatos = await Contato.find({ empresa_id: empresaId }).sort({ nome: 1 });
      }
    }

    res.json({
      success: true,
      data: {
        contatos: contatos.map((contato) => ({
          id: contato._id.toString(),
          nome: contato.nome,
          numero: contato.numero,
          empresa: contato.empresa,
          segmento: contato.segmento,
          observacao: contato.observacao,
          origem: contato.origem
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao listar contatos do discador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar contatos'
    });
  }
};

export const criarContato = async (
  req: AuthRequest,
  res: Response<ApiResponse<{ id: string }>>
): Promise<void> => {
  try {
    const { nome, numero, empresa, segmento, observacao } = req.body;
    if (!nome || !numero || !empresa || !segmento) {
      res.status(400).json({
        success: false,
        message: 'Nome, número, empresa e segmento são obrigatórios'
      });
      return;
    }

    const empresaId = await obterEmpresaId(req);
    if (!empresaId) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada para o usuário autenticado'
      });
      return;
    }

    const contato = await Contato.create({
      empresa_id: empresaId,
      nome,
      numero,
      empresa,
      segmento,
      observacao,
      origem: 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Contato criado com sucesso',
      data: { id: contato._id.toString() }
    });
  } catch (error: any) {
    console.error('Erro ao criar contato:', error);
    if (error?.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Já existe um contato com este número para a empresa'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar contato'
    });
  }
};


