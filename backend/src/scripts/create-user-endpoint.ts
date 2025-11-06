import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Empresa, Gestor, Operador } from '../models';

async function createUserHandler() {
  try {
    console.log('🔐 Conectando ao MongoDB...');
    
    const databaseUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('MONGODB_URI ou DATABASE_URL não configurada.');
    }
    
    await mongoose.connect(databaseUrl);
    console.log('✅ Conectado ao MongoDB');
    
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log('🔑 Senha hasheada criada');
    
    // Verificar se empresa TeleUp existe
    let empresa = await Empresa.findOne({ email: 'contato@teleup.com' });
    
    let empresaId;
    if (!empresa) {
      console.log('🏢 Empresa não encontrada, criando...');
      empresa = await Empresa.create({
        nome: 'TeleUp',
        email: 'contato@teleup.com',
        senha: hashedPassword,
        status: 'Ativo'
      });
      empresaId = empresa._id;
      console.log('✅ Empresa criada com ID:', empresaId.toString());
    } else {
      empresaId = empresa._id;
      console.log('✅ Empresa encontrada com ID:', empresaId.toString());
    }
    
    // Verificar se gestor já existe
    let gestor = await Gestor.findOne({ email: 'hyttalo@teleup.com' });
    
    if (!gestor) {
      console.log('👤 Gestor não encontrado, criando...');
      gestor = await Gestor.create({
        empresa_id: empresaId,
        nome: 'Hyttalo Costa',
        email: 'hyttalo@teleup.com',
        senha: hashedPassword,
        status: 'Ativo'
      });
      console.log('✅ Gestor criado com ID:', gestor._id.toString());
    } else {
      console.log('✅ Gestor já existe com ID:', gestor._id.toString());
      await Gestor.updateOne(
        { _id: gestor._id },
        { senha: hashedPassword }
      );
      console.log('🔑 Senha do gestor atualizada');
    }
    
    // Criar/atualizar operadores de teste
    const operadores = [
      { nome: 'Hyttalo Costa', email: 'hyttalo@teleup.com', pa: 'PA001', carteira: 'C001' },
      { nome: 'Mateus Silva', email: 'mateus@teleup.com', pa: 'PA002', carteira: 'C002' },
      { nome: 'Guilherme Santos', email: 'guilherme@teleup.com', pa: 'PA003', carteira: 'C003' },
      { nome: 'Vinicius Oliveira', email: 'vinicius@teleup.com', pa: 'PA004', carteira: 'C004' }
    ];
    
    for (const operadorData of operadores) {
      let operador = await Operador.findOne({ email: operadorData.email });
      
      if (!operador) {
        console.log(`👤 Operador ${operadorData.nome} não encontrado, criando...`);
        operador = await Operador.create({
          empresa_id: empresaId,
          gestor_id: gestor._id,
          nome: operadorData.nome,
          email: operadorData.email,
          senha: hashedPassword,
          pa: operadorData.pa,
          carteira: operadorData.carteira,
          nivel: 1,
          xp: 0,
          pontos_totais: 0,
          status: 'Ativo',
          status_operacional: 'Offline'
        });
        console.log(`✅ Operador ${operadorData.nome} criado com ID:`, operador._id.toString());
      } else {
        console.log(`✅ Operador ${operadorData.nome} já existe com ID:`, operador._id.toString());
        await Operador.updateOne(
          { _id: operador._id },
          { senha: hashedPassword }
        );
        console.log(`🔑 Senha do operador ${operadorData.nome} atualizada`);
      }
    }
    
    await mongoose.disconnect();
    
    return {
      success: true,
      message: 'Todos os usuários criados com sucesso',
      credentials: {
        gestor: { email: 'hyttalo@teleup.com', password: 'password' },
        empresa: { email: 'contato@teleup.com', password: 'password' },
        operadores: [
          { email: 'hyttalo@teleup.com', password: 'password' },
          { email: 'mateus@teleup.com', password: 'password' },
          { email: 'guilherme@teleup.com', password: 'password' },
          { email: 'vinicius@teleup.com', password: 'password' }
        ]
      }
    };
    
  } catch (error: any) {
    console.error('❌ Erro ao inserir usuário:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export { createUserHandler };
