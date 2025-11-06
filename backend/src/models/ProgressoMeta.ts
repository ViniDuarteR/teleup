import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressoMeta extends Document {
  meta_id: mongoose.Types.ObjectId;
  operador_id: mongoose.Types.ObjectId;
  progresso_atual: number;
  data_atualizacao: Date;
}

const ProgressoMetaSchema = new Schema<IProgressoMeta>({
  meta_id: { type: Schema.Types.ObjectId, ref: 'Meta', required: true },
  operador_id: { type: Schema.Types.ObjectId, ref: 'Operador', required: true },
  progresso_atual: { type: Number, default: 0 },
  data_atualizacao: { type: Date, default: Date.now }
});

// Índice único para meta_id + operador_id
ProgressoMetaSchema.index({ meta_id: 1, operador_id: 1 }, { unique: true });
ProgressoMetaSchema.index({ meta_id: 1 });
ProgressoMetaSchema.index({ operador_id: 1 });

export const ProgressoMeta = mongoose.model<IProgressoMeta>('ProgressoMeta', ProgressoMetaSchema);

