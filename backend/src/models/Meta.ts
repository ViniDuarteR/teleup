import mongoose, { Schema, Document } from 'mongoose';

export interface IMeta extends Document {
  empresa_id: mongoose.Types.ObjectId;
  titulo: string;
  descricao?: string;
  tipo?: string;
  valor_meta: number;
  periodo?: string;
  data_inicio: Date;
  data_fim?: Date;
  ativa: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

const MetaSchema = new Schema<IMeta>({
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
  titulo: { type: String, required: true, maxlength: 255 },
  descricao: { type: String },
  tipo: { type: String, maxlength: 100 },
  valor_meta: { type: Number, required: true },
  periodo: { type: String, maxlength: 100 },
  data_inicio: { type: Date, default: Date.now },
  data_fim: { type: Date },
  ativa: { type: Boolean, default: true },
  criado_em: { type: Date, default: Date.now },
  atualizado_em: { type: Date, default: Date.now }
});

// Atualizar atualizado_em antes de salvar
MetaSchema.pre('save', function(next) {
  this.atualizado_em = new Date();
  next();
});

// Índices
MetaSchema.index({ empresa_id: 1 });
MetaSchema.index({ ativa: 1 });

export const Meta = mongoose.model<IMeta>('Meta', MetaSchema);

