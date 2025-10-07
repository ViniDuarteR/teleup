import { Request, Response } from 'express';
import { ApiResponse, AuthRequest } from '../types';
export declare const loginEmpresa: (req: Request, res: Response) => Promise<void>;
export declare const listarGestoresEmpresa: (req: AuthRequest, res: Response<ApiResponse<any[]>>) => Promise<void>;
export declare const criarGestorEmpresa: (req: AuthRequest, res: Response<ApiResponse<{
    id: number;
}>>) => Promise<void>;
export declare const listarOperadoresEmpresa: (req: AuthRequest, res: Response<ApiResponse<any[]>>) => Promise<void>;
export declare const atualizarGestorEmpresa: (req: AuthRequest, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const excluirGestorEmpresa: (req: AuthRequest, res: Response<ApiResponse<any>>) => Promise<void>;
export declare const getDashboardEmpresa: (req: AuthRequest, res: Response<ApiResponse<any>>) => Promise<void>;
//# sourceMappingURL=empresaController.d.ts.map