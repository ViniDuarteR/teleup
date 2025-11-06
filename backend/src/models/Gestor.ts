import mongoose, { Schema, Document } from 'mongoose';

export interface IGestor extends Document {
  empresa_id: mongoose.Types.ObjectId;
  nome: string;
  email: string;
  senha: string;
  avatar?: string;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  data_criacao: Date;
  data_atualizacao: Date;
  data_ultimo_login?: Date;
}

const GestorSchema = new Schema<IGestor>({
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
  nome: { type: String, required: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, maxlength: 150 },
  senha: { type: String, required: true },
  avatar: { type: String },
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
GestorSchema.pre('save', function(next) {
  this.data_atualizacao = new Date();
  next();
});

// Índices
GestorSchema.index({ empresa_id: 1 });
GestorSchema.index({ email: 1 });

export const Gestor = mongoose.model<IGestor>('Gestor', GestorSchema);

