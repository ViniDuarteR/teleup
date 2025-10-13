import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { ApiResponse, AuthRequest } from '../types';

// Cadastro de empresa
export const cadastrarEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🚀 [CADASTRO EMPRESA] Controller chamado!');
    console.log('🚀 [CADASTRO EMPRESA] Headers:', req.headers);
    console.log('🚀 [CADASTRO EMPRESA] Body:', req.body);
    
    const { nome, email, senha, telefone, cnpj, endereco, cidade, estado, cep } = req.body;
    
    console.log(`🏢 [CADASTRO EMPRESA] Tentativa de cadastro para: ${email}`);

    // Validações básicas
    if (!nome || !email || !senha || !cnpj) {
      console.log(`❌ [CADASTRO EMPRESA] Dados incompletos`);
      res.status(400).json({
        success: false,
        message: 'Nome, email, senha e CNPJ são obrigatórios'
      });
      return;
    }

    // Verificar se email já existe
    console.log(`🔍 [CADASTRO EMPRESA] Verificando se email já existe: ${email}`);
    const [empresasExistentes] = await pool.execute(
      'SELECT id FROM empresas WHERE email = ?',
      [email]
    );

    if ((empresasExistentes as any[]).length > 0) {
      console.log(`❌ [CADASTRO EMPRESA] Email já cadastrado: ${email}`);
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
      return;
    }

    // Hash da senha
    console.log(`🔐 [CADASTRO EMPRESA] Gerando hash da senha`);
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir empresa no banco
    console.log(`💾 [CADASTRO EMPRESA] Inserindo empresa no banco`);
    console.log(`💾 [CADASTRO EMPRESA] Dados:`, {
      nome,
      email,
      telefone: telefone || null,
      cnpj,
      endereco: endereco || null,
      cidade: cidade || null,
      estado: estado || null,
      cep: cep || null
    });
    
    const [result] = await pool.execute(
      `INSERT INTO empresas (nome, email, senha, telefone, cnpj, endereco, cidade, estado, cep, status, data_criacao) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ativo', NOW()) RETURNING id`,
      [nome, email, senhaHash, telefone || null, cnpj, endereco || null, cidade || null, estado || null, cep || null]
    );

    console.log(`💾 [CADASTRO EMPRESA] Resultado da inserção:`, result);
    const empresaId = (result as any[])[0]?.id;

    console.log(`✅ [CADASTRO EMPRESA] Empresa cadastrada com sucesso - ID: ${empresaId}`);

    res.status(201).json({
      success: true,
      message: 'Empresa cadastrada com sucesso',
      data: {
        id: empresaId,
        nome,
        email
      }
    });

  } catch (error: any) {
    console.error(`❌ [CADASTRO EMPRESA] Erro no cadastro da empresa:`, error);
    console.error(`❌ [CADASTRO EMPRESA] Stack trace:`, error.stack);

    // Verificar se é erro de conexão com banco
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      res.status(503).json({
        success: false,
        message: 'Erro de conexão com o banco de dados'
      });
      return;
    }

    // Verificar se é erro de query
    if (error?.code && error.code.startsWith('23')) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos fornecidos'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login da empresa
export const loginEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    console.log(`🔐 [EMPRESA LOGIN] Tentativa de login iniciada para: ${email}`);

    if (!email || !senha) {
      console.log(`❌ [EMPRESA LOGIN] Dados incompletos - Email: ${!!email}, Senha: ${!!senha}`);
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    console.log(`🔍 [EMPRESA LOGIN] Buscando empresa no banco de dados para: ${email}`);
    // Buscar empresa
    const [empresas] = await pool.execute(
      'SELECT id, nome, email, senha, status FROM empresas WHERE email = $1 AND status = $2',
      [email, 'Ativo']
    );

    console.log(`📊 [EMPRESA LOGIN] Resultado da busca: ${(empresas as any[]).length} empresa(s) encontrada(s)`);

    const empresa = (empresas as any[])[0];

    if (!empresa) {
      console.log(`❌ [EMPRESA LOGIN] Empresa não encontrada ou inativa para: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Empresa não encontrada ou inativa'
      });
      return;
    }

    console.log(`✅ [EMPRESA LOGIN] Empresa encontrada - ID: ${empresa.id}, Nome: ${empresa.nome}, Status: ${empresa.status}`);

    // Verificar senha
    console.log(`🔐 [EMPRESA LOGIN] Verificando senha para empresa ID: ${empresa.id}`);
    const senhaValida = await bcrypt.compare(senha, empresa.senha);
    console.log(`🔐 [EMPRESA LOGIN] Senha válida: ${senhaValida}`);
    
    if (!senhaValida) {
      console.log(`❌ [EMPRESA LOGIN] Senha inválida para empresa: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token JWT
    console.log(`🎫 [EMPRESA LOGIN] Gerando token JWT para empresa ID: ${empresa.id}`);
    const token = jwt.sign(
      { 
        empresaId: empresa.id, 
        tipo: 'empresa',
        email: empresa.email 
      },
      process.env.JWT_SECRET || 'teleup_secret',
      { expiresIn: '24h' }
    );
    console.log(`🎫 [EMPRESA LOGIN] Token JWT gerado com sucesso`);

    // Salvar sessão
    const expiracao = new Date();
    expiracao.setHours(expiracao.getHours() + 24);

    console.log(`💾 [EMPRESA LOGIN] Tentando salvar sessão para empresa ID: ${empresa.id}`);
    try {
      await pool.execute(
        'INSERT INTO sessoes_empresa (empresa_id, token, expiracao) VALUES ($1, $2, $3)',
        [empresa.id, token, expiracao]
      );
      console.log(`✅ [EMPRESA LOGIN] Sessão salva na tabela 'sessoes_empresa' com sucesso`);
    } catch (error: any) {
      console.error(`⚠️ [EMPRESA LOGIN] Erro ao salvar sessão da empresa: ${error.message}`);
      console.error(`⚠️ [EMPRESA LOGIN] Stack trace:`, error.stack);
      // Continuar mesmo se falhar ao salvar sessão
    }

    // Atualizar último login
    console.log(`📊 [EMPRESA LOGIN] Atualizando data do último login para empresa ID: ${empresa.id}`);
    await pool.execute(
      'UPDATE empresas SET data_ultimo_login = NOW() WHERE id = $1',
      [empresa.id]
    );
    console.log(`✅ [EMPRESA LOGIN] Data do último login atualizada com sucesso`);

    // Preparar dados da empresa (sem senha)
    console.log(`📋 [EMPRESA LOGIN] Preparando dados da empresa para resposta`);
    const empresaData = {
      id: empresa.id,
      nome: empresa.nome,
      email: empresa.email,
      status: empresa.status
    };

    console.log(`🎉 [EMPRESA LOGIN] Login realizado com sucesso para: ${email}`);
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        empresa: empresaData
      }
    });
  } catch (error: any) {
    console.error(`❌ [EMPRESA LOGIN] Erro no login da empresa ${req.body?.email}:`, error);
    console.error(`❌ [EMPRESA LOGIN] Stack trace:`, error.stack);
    
    // Verificar se é erro de conexão com banco
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      console.log(`❌ [EMPRESA LOGIN] Erro de conexão com banco de dados`);
      res.status(500).json({
        success: false,
        message: 'Erro de conexão com banco de dados'
      });
      return;
    }
    
    // Verificar se é erro de query
    if (error?.code && error.code.startsWith('23')) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos fornecidos'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar gestores da empresa
export const listarGestoresEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    const [gestores] = await pool.execute(
      'SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE empresa_id = ?',
      [empresaId]
    );

    res.json({
      success: true,
      data: gestores as any[]
    });
  } catch (error) {
    console.error('Erro ao listar gestores da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar gestor para a empresa
export const criarGestorEmpresa = async (req: AuthRequest, res: Response<ApiResponse<{ id: number }>>): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    // Verificar se email já existe
    const [emailExists] = await pool.execute(
      'SELECT id FROM gestores WHERE email = ?',
      [email]
    );

    if ((emailExists as any[]).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.execute(
      'INSERT INTO gestores (nome, email, senha, status, avatar, empresa_id) VALUES (?, ?, ?, "Ativo", "avatar_gestor.png", ?)',
      [nome, email, senhaHash, empresaId]
    );

    const insertResult = result as any;
    res.status(201).json({
      success: true,
      message: 'Gestor criado com sucesso',
      data: { id: insertResult.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar operadores da empresa
export const listarOperadoresEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    const [operadores] = await pool.execute(
      `SELECT o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, o.pontos_totais, 
              o.status, o.avatar, o.tempo_online, o.pa, o.carteira, o.data_criacao,
              g.nome as gestor_nome, g.email as gestor_email
       FROM operadores o
       LEFT JOIN operador_gestor og ON o.id = og.operador_id
       LEFT JOIN gestores g ON og.gestor_id = g.id
       WHERE o.empresa_id = ?
       ORDER BY o.pontos_totais DESC`,
      [empresaId]
    );

    res.json({
      success: true,
      data: operadores as any[]
    });
  } catch (error) {
    console.error('Erro ao listar operadores da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar gestor da empresa
export const atualizarGestorEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, senha, status } = req.body;
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    // Verificar se o gestor pertence à empresa
    const [gestorExists] = await pool.execute(
      'SELECT id FROM gestores WHERE id = ? AND empresa_id = ?',
      [id, empresaId]
    );

    if ((gestorExists as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado ou não pertence à empresa'
      });
      return;
    }

    // Verificar se email já existe em outro gestor
    if (email) {
      const [emailExists] = await pool.execute(
        'SELECT id FROM gestores WHERE email = ? AND id != ?',
        [email, id]
      );

      if ((emailExists as any[]).length > 0) {
        res.status(400).json({
          success: false,
          message: 'Email já cadastrado por outro gestor'
        });
        return;
      }
    }

    // Preparar dados para atualização
    let updateFields = [];
    let updateValues = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updateFields.push('senha = ?');
      updateValues.push(senhaHash);
    }

    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateFields.push('data_atualizacao = NOW()');
    updateValues.push(id);

    if (updateFields.length === 1) { // Apenas data_atualizacao
      res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
      return;
    }

    await pool.execute(
      `UPDATE gestores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Gestor atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir gestor da empresa
export const excluirGestorEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const { id } = req.params;
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    // Verificar se o gestor pertence à empresa
    const [gestorExists] = await pool.execute(
      'SELECT id FROM gestores WHERE id = ? AND empresa_id = ?',
      [id, empresaId]
    );

    if ((gestorExists as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado ou não pertence à empresa'
      });
      return;
    }

    // Verificar se o gestor tem operadores atribuídos
    const [operadoresAtribuidos] = await pool.execute(
      'SELECT COUNT(*) as total FROM operador_gestor WHERE gestor_id = ?',
      [id]
    );

    if ((operadoresAtribuidos as any[])[0].total > 0) {
      res.status(400).json({
        success: false,
        message: 'Não é possível excluir gestor que possui operadores atribuídos'
      });
      return;
    }

    // Excluir gestor
    await pool.execute(
      'DELETE FROM gestores WHERE id = ? AND empresa_id = ?',
      [id, empresaId]
    );

    res.json({
      success: true,
      message: 'Gestor excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Dashboard da empresa
export const getDashboardEmpresa = async (req: AuthRequest, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const empresaId = req.empresa?.id;

    if (!empresaId) {
      res.status(401).json({
        success: false,
        message: 'Empresa não autenticada'
      });
      return;
    }

    // Buscar estatísticas da empresa
    const [totalGestores] = await pool.execute(
      'SELECT COUNT(*) as total FROM gestores WHERE empresa_id = ?',
      [empresaId]
    );

    const [totalOperadores] = await pool.execute(
      'SELECT COUNT(*) as total FROM operadores WHERE empresa_id = ?',
      [empresaId]
    );

    const [operadoresAtivos] = await pool.execute(
      'SELECT COUNT(*) as total FROM operadores WHERE empresa_id = ? AND status IN ("Dispon??vel", "Em Chamada")',
      [empresaId]
    );

    const [totalPontos] = await pool.execute(
      'SELECT COALESCE(SUM(pontos_totais), 0) as total FROM operadores WHERE empresa_id = ?',
      [empresaId]
    );

    res.json({
      success: true,
      data: {
        totalGestores: (totalGestores as any[])[0].total,
        totalOperadores: (totalOperadores as any[])[0].total,
        operadoresAtivos: (operadoresAtivos as any[])[0].total,
        totalPontos: (totalPontos as any[])[0].total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
