export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'operador' | 'gestor' | 'empresa';
  nivel?: number;
  xp_atual?: number;
  xp_proximo_nivel?: number;
  pontos_totais?: number;
  status: string;
  avatar?: string;
  tempo_online?: number;
  data_criacao: string;
  data_atualizacao: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
