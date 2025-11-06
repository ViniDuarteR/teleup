// Script para inicializar o banco de dados MongoDB
// Execute após o build: npm run build && node scripts/init-database.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Definir schemas inline (já que os modelos compilados podem não estar disponíveis)
const EmpresaSchema = new mongoose.Schema({
  nome: { type: String, required: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  senha: { type: String, required: true },
  telefone: { type: String, maxlength: 20 },
  cnpj: { type: String, required: true, unique: true, maxlength: 20 },
  endereco: { type: String, maxlength: 255 },
  cidade: { type: String, maxlength: 100 },
  estado: { type: String, maxlength: 50 },
  cep: { type: String, maxlength: 10 },
  status: { type: String, enum: ['Ativo', 'Inativo', 'Suspenso'], default: 'Ativo' },
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
  data_ultimo_login: { type: Date }
});

const GestorSchema = new mongoose.Schema({
  empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  nome: { type: String, required: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  senha: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, enum: ['Ativo', 'Inativo', 'Suspenso'], default: 'Ativo' },
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
  data_ultimo_login: { type: Date }
});

const OperadorSchema = new mongoose.Schema({
  empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  gestor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gestor' },
  nome: { type: String, required: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  senha: { type: String, required: true },
  avatar: { type: String },
  pa: { type: String, maxlength: 50 },
  carteira: { type: String, maxlength: 50 },
  nivel: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  pontos_totais: { type: Number, default: 0 },
  status: { type: String, enum: ['Ativo', 'Inativo', 'Suspenso'], default: 'Ativo' },
  tempo_online: { type: Number, default: 0 },
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
  status_operacional: { 
    type: String, 
    enum: ['Aguardando Chamada', 'Em Chamada', 'Em Pausa', 'Offline'], 
    default: 'Offline' 
  }
});

const RecompensaSchema = new mongoose.Schema({
  empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  titulo: { type: String, required: true, maxlength: 200 },
  descricao: { type: String },
  categoria: { 
    type: String, 
    enum: ['Produtos', 'Servicos', 'Vouchers', 'Outros'], 
    default: 'Outros' 
  },
  preco: { type: Number, required: true },
  tipo: { type: String },
  raridade: { type: String },
  imagem: { type: String },
  disponivel: { type: Boolean, default: true },
  quantidade_restante: { type: Number },
  criado_em: { type: Date, default: Date.now },
  atualizado_em: { type: Date, default: Date.now }
});

const Empresa = mongoose.models.Empresa || mongoose.model('Empresa', EmpresaSchema);
const Gestor = mongoose.models.Gestor || mongoose.model('Gestor', GestorSchema);
const Operador = mongoose.models.Operador || mongoose.model('Operador', OperadorSchema);
const Recompensa = mongoose.models.Recompensa || mongoose.model('Recompensa', RecompensaSchema);

async function initDatabase() {
  console.log('🗄️ Inicializando banco de dados MongoDB...');
  
  try {
    // Conectar ao MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/teleup';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existem dados
    const empresasCount = await Empresa.countDocuments();
    if (empresasCount > 0) {
      console.log('ℹ️ Banco de dados já inicializado');
      await mongoose.disconnect();
      return;
    }

    // Criar empresas
    const empresa1 = await Empresa.create({
      nome: 'TeleUp',
      email: 'contato@teleup.com',
      senha: await bcrypt.hash('password', 10),
      telefone: '(11) 99999-9999',
      cnpj: '12345678000123',
      endereco: 'Rua das Empresas, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      status: 'Ativo'
    });

    const empresa2 = await Empresa.create({
      nome: 'TechCorp',
      email: 'admin@techcorp.com',
      senha: await bcrypt.hash('password', 10),
      telefone: '(11) 88888-8888',
      cnpj: '98765432000198',
      endereco: 'Av. Tecnologia, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '09876-543',
      status: 'Ativo'
    });

    console.log('✅ Empresas criadas');

    // Criar gestores
    const gestor1 = await Gestor.create({
      empresa_id: empresa1._id,
      nome: 'Hyttalo Costa',
      email: 'hyttalo@teleup.com',
      senha: await bcrypt.hash('password', 10),
      status: 'Ativo'
    });

    const gestor2 = await Gestor.create({
      empresa_id: empresa2._id,
      nome: 'Roberto Silva',
      email: 'roberto.silva@techcorp.com',
      senha: await bcrypt.hash('password', 10),
      status: 'Ativo'
    });

    console.log('✅ Gestores criados');

    // Criar operadores
    await Operador.create([
      {
        empresa_id: empresa1._id,
        gestor_id: gestor1._id,
        nome: 'Mateus Silva',
        email: 'mateus@teleup.com',
        senha: await bcrypt.hash('password', 10),
        pa: 'PA001',
        carteira: 'C001',
        nivel: 1,
        xp: 0,
        pontos_totais: 0,
        status: 'Ativo',
        status_operacional: 'Offline'
      },
      {
        empresa_id: empresa1._id,
        gestor_id: gestor1._id,
        nome: 'Guilherme Santos',
        email: 'guilherme@teleup.com',
        senha: await bcrypt.hash('password', 10),
        pa: 'PA002',
        carteira: 'C002',
        nivel: 1,
        xp: 0,
        pontos_totais: 0,
        status: 'Ativo',
        status_operacional: 'Offline'
      },
      {
        empresa_id: empresa1._id,
        gestor_id: gestor1._id,
        nome: 'Vinicius Oliveira',
        email: 'vinicius@teleup.com',
        senha: await bcrypt.hash('password', 10),
        pa: 'PA003',
        carteira: 'C003',
        nivel: 1,
        xp: 0,
        pontos_totais: 0,
        status: 'Ativo',
        status_operacional: 'Offline'
      }
    ]);

    console.log('✅ Operadores criados');

    // Criar recompensas
    await Recompensa.create([
      {
        titulo: 'Vale Presente R$ 10',
        descricao: 'Vale presente de R$ 10 para uso em lojas parceiras',
        categoria: 'Vouchers',
        preco: 100,
        disponivel: true
      },
      {
        titulo: 'Vale Presente R$ 25',
        descricao: 'Vale presente de R$ 25 para uso em lojas parceiras',
        categoria: 'Vouchers',
        preco: 250,
        disponivel: true
      },
      {
        titulo: 'Vale Presente R$ 50',
        descricao: 'Vale presente de R$ 50 para uso em lojas parceiras',
        categoria: 'Vouchers',
        preco: 500,
        disponivel: true
      },
      {
        titulo: 'Dia de Folga',
        descricao: 'Um dia de folga adicional',
        categoria: 'Outros',
        preco: 1000,
        disponivel: true
      }
    ]);

    console.log('✅ Recompensas criadas');
    console.log('✅ Banco de dados inicializado com sucesso!');
    
    // Listar coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Coleções criadas:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    await mongoose.disconnect();
    
  } catch (error) {
    if (error.message?.includes('E11000')) {
      console.log('ℹ️ Banco de dados já inicializado (dados duplicados ignorados)');
    } else {
      console.error('❌ Erro ao inicializar banco:', error.message);
      throw error;
    }
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  initDatabase().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = initDatabase;
