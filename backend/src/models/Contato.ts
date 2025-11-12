import mongoose, { Schema, Document } from 'mongoose';

export interface IContato extends Document {
  empresa_id: mongoose.Types.ObjectId;
  nome: string;
  numero: string;
  empresa: string;
  segmento: string;
  observacao?: string;
  origem?: string;
  criado_em: Date;
  atualizado_em: Date;
}

const ContatoSchema = new Schema<IContato>({
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
  nome: { type: String, required: true, maxlength: 150 },
  numero: { type: String, required: true, maxlength: 20 },
  empresa: { type: String, required: true, maxlength: 150 },
  segmento: { type: String, required: true, maxlength: 100 },
  observacao: { type: String, maxlength: 500 },
  origem: { type: String, maxlength: 100 },
  criado_em: { type: Date, default: Date.now },
  atualizado_em: { type: Date, default: Date.now },
});

ContatoSchema.pre('save', function (next) {
  this.atualizado_em = new Date();
  next();
});

ContatoSchema.index({ empresa_id: 1 });
ContatoSchema.index({ empresa_id: 1, nome: 1 });
ContatoSchema.index({ empresa_id: 1, numero: 1 }, { unique: true });

export const Contato = mongoose.model<IContato>('Contato', ContatoSchema);


