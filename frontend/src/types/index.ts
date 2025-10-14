export interface EmpresaData {
  id: number;
  nome: string;
  email: string;
  status: string;
}

export interface UsuarioData {
  id: number;
  nome: string;
  email: string;
  tipo: string;
  status: string;
}

export interface ChamadaData {
  id: number;
  cliente: string;
  telefone: string;
  motivo: string;
  status: string;
  data: string;
  operador?: string;
}

export interface RecompensaData {
  id: number;
  nome: string;
  descricao: string;
  pontos: number;
  categoria: string;
  status: string;
}
