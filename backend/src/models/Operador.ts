import mongoose, { Schema, Document } from 'mongoose';

export interface IOperador extends Document {
  empresa_id: mongoose.Types.ObjectId;
  gestor_id?: mongoose.Types.ObjectId;
  nome: string;
  email: string;
  senha: string;
  avatar?: string;
  pa?: string;
  carteira?: string;
  nivel: number;
  xp: number;
  pontos_totais: number;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  tempo_online: number;
  data_criacao: Date;
  data_atualizacao: Date;
  status_operacional: 'Aguardando Chamada' | 'Em Chamada' | 'Em Pausa' | 'Offline';
}

const OperadorSchema = new Schema<IOperador>({
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
  gestor_id: { type: Schema.Types.ObjectId, ref: 'Gestor' },
  nome: { type: String, required: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  senha: { type: String, required: true },
  avatar: { type: String },
  pa: { type: String, maxlength: 50 },
  carteira: { type: String, maxlength: 50 },
  nivel: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  pontos_totais: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Ativo', 'Inativo', 'Suspenso'], 
    default: 'Ativo' 
  },
  tempo_online: { type: Number, default: 0 },
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
  status_operacional: { 
    type: String, 
    enum: ['Aguardando Chamada', 'Em Chamada', 'Em Pausa', 'Offline'], 
    default: 'Offline' 
  }
});

// Atualizar data_atualizacao antes de salvar
OperadorSchema.pre('save', function(next) {
  this.data_atualizacao = new Date();
  next();
});

// Índices
OperadorSchema.index({ empresa_id: 1 });
OperadorSchema.index({ gestor_id: 1 });
// Índice de email já criado automaticamente pelo unique: true

export const Operador = mongoose.model<IOperador>('Operador', OperadorSchema);

