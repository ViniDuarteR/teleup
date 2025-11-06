import mongoose, { Schema, Document } from 'mongoose';

export interface ISessao extends Document {
  operador_id?: mongoose.Types.ObjectId;
  empresa_id?: mongoose.Types.ObjectId;
  token: string;
  ativo: boolean;
  expiracao: Date;
  criado_em: Date;
}

const SessaoSchema = new Schema<ISessao>({
  operador_id: { type: Schema.Types.ObjectId, ref: 'Operador' },
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Empresa' },
  token: { type: String, required: true },
  ativo: { type: Boolean, default: true },
  expiracao: { type: Date, required: true },
  criado_em: { type: Date, default: Date.now }
});

// Índices
SessaoSchema.index({ operador_id: 1 });
SessaoSchema.index({ empresa_id: 1 });
SessaoSchema.index({ token: 1 });

export const Sessao = mongoose.model<ISessao>('Sessao', SessaoSchema);

