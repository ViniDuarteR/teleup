import mongoose, { Schema, Document } from 'mongoose';

export interface ICompra extends Document {
  operador_id: mongoose.Types.ObjectId;
  recompensa_id: mongoose.Types.ObjectId;
  preco_pago: number;
  status: string;
  data_compra: Date;
  criado_em: Date;
}

const CompraSchema = new Schema<ICompra>({
  operador_id: { type: Schema.Types.ObjectId, ref: 'Operador', required: true },
  recompensa_id: { type: Schema.Types.ObjectId, ref: 'Recompensa', required: true },
  preco_pago: { type: Number, required: true },
  status: { type: String, default: 'aprovada' },
  data_compra: { type: Date, default: Date.now },
  criado_em: { type: Date, default: Date.now }
});

// Índices
CompraSchema.index({ operador_id: 1 });
CompraSchema.index({ recompensa_id: 1 });
CompraSchema.index({ data_compra: -1 });

export const Compra = mongoose.model<ICompra>('Compra', CompraSchema);

