import { Request, Response } from 'express';
import { AuthRequest, LoginRequest, LoginResponse, ApiResponse } from '../types';
export declare const loginGestor: (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>) => Promise<void>;
export declare const logoutGestor: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getOperadoresGerenciados: (req: AuthRequest, res: Response<ApiResponse<any[]>>) => Promise<void>;
export declare const atribuirOperador: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const removerOperador: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=gestorController.d.ts.map