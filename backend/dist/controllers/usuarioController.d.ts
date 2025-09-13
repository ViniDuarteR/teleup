import { Response } from 'express';
import { AuthRequest, ApiResponse, Operador } from '../types';
export declare const listarUsuarios: (req: AuthRequest, res: Response<ApiResponse<Operador[]>>) => Promise<void>;
export declare const criarUsuario: (req: AuthRequest, res: Response<ApiResponse<{
    id: number;
}>>) => Promise<void>;
export declare const atualizarUsuario: (req: AuthRequest, res: Response<ApiResponse<void>>) => Promise<void>;
export declare const excluirUsuario: (req: AuthRequest, res: Response<ApiResponse<void>>) => Promise<void>;
export declare const redefinirSenha: (req: AuthRequest, res: Response<ApiResponse<void>>) => Promise<void>;
//# sourceMappingURL=usuarioController.d.ts.map