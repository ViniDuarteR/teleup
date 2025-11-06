import mongoose, { Schema, Document } from 'mongoose';

export interface IChamada extends Document {
  operador_id: mongoose.Types.ObjectId;
  numero_cliente?: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  tipo_chamada?: 'Entrada' | 'Saida' | 'Interna';
  status: string;
  inicio_chamada: Date;
  fim_chamada?: Date;
  duracao?: number;
  duracao_segundos?: number;
  satisfacao_cliente?: number;
  resolvida?: boolean;
  observacoes?: string;
  criado_em: Date;
  pontos_ganhos?: number;
}

const ChamadaSchema = new Schema<IChamada>({
  operador_id: { type: Schema.Types.ObjectId, ref: 'Operador', required: true },
  numero_cliente: { type: String },
  cliente_nome: { type: String, maxlength: 255 },
  cliente_telefone: { type: String, maxlength: 50 },
  tipo_chamada: { type: String, enum: ['Entrada', 'Saida', 'Interna'], default: 'Entrada' },
  status: { type: String, default: 'Concluída', maxlength: 100 },
  inicio_chamada: { type: Date, default: Date.now },
  fim_chamada: { type: Date },
  duracao: { type: Number },
  duracao_segundos: { type: Number },
  satisfacao_cliente: { type: Number, min: 1, max: 5 },
  resolvida: { type: Boolean, default: false },
  observacoes: { type: String },
  criado_em: { type: Date, default: Date.now },
  pontos_ganhos: { type: Number, default: 0 }
});

// Índices
ChamadaSchema.index({ operador_id: 1 });
ChamadaSchema.index({ inicio_chamada: -1 });

export const Chamada = mongoose.model<IChamada>('Chamada', ChamadaSchema);

