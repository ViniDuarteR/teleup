import mongoose, { Schema, Document } from 'mongoose';

export interface IRecompensa extends Document {
  empresa_id?: mongoose.Types.ObjectId;
  titulo: string;
  descricao?: string;
  categoria: 'Produtos' | 'Servicos' | 'Vouchers' | 'Outros';
  preco: number;
  tipo?: string;
  raridade?: string;
  imagem?: string;
  disponivel: boolean;
  quantidade_restante?: number;
  criado_em: Date;
  atualizado_em: Date;
}

const RecompensaSchema = new Schema<IRecompensa>({
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Empresa' },
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

// Atualizar atualizado_em antes de salvar
RecompensaSchema.pre('save', function(next) {
  this.atualizado_em = new Date();
  next();
});

export const Recompensa = mongoose.model<IRecompensa>('Recompensa', RecompensaSchema);

