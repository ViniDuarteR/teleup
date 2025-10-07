import { Request, Response } from 'express';
import { ApiResponse, LoginRequest, LoginResponse } from '../types';
export declare const loginGestor: (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>) => Promise<void>;
export declare const listarGestores: (req: any, res: Response) => Promise<void>;
export declare const criarGestor: (req: any, res: Response) => Promise<void>;
export declare const atualizarGestor: (req: any, res: Response) => Promise<void>;
export declare const excluirGestor: (req: any, res: Response) => Promise<void>;
export declare const logoutGestor: (req: any, res: Response) => Promise<void>;
export declare const getOperadoresGerenciados: (req: any, res: Response) => Promise<void>;
export declare const atribuirOperador: (req: any, res: Response) => Promise<void>;
export declare const removerOperador: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=gestorController.d.ts.map