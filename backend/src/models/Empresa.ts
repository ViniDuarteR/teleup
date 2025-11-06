import mongoose, { Schema, Document } from 'mongoose';

export interface IEmpresa extends Document {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cnpj: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  data_criacao: Date;
  data_atualizacao: Date;
  data_ultimo_login?: Date;
}

const EmpresaSchema = new Schema<IEmpresa>({
  nome: { type: String, required: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  senha: { type: String, required: true },
  telefone: { type: String, maxlength: 20 },
  cnpj: { type: String, required: true, unique: true, maxlength: 20 },
  endereco: { type: String, maxlength: 255 },
  cidade: { type: String, maxlength: 100 },
  estado: { type: String, maxlength: 50 },
  cep: { type: String, maxlength: 10 },
  status: { 
    type: String, 
    enum: ['Ativo', 'Inativo', 'Suspenso'], 
    default: 'Ativo' 
  },
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
  data_ultimo_login: { type: Date }
});

// Atualizar data_atualizacao antes de salvar
EmpresaSchema.pre('save', function(next) {
  this.data_atualizacao = new Date();
  next();
});

// Índices
EmpresaSchema.index({ email: 1 });
EmpresaSchema.index({ cnpj: 1 });

export const Empresa = mongoose.model<IEmpresa>('Empresa', EmpresaSchema);

