import { Request, Response } from 'express';
import { AuthRequest, LoginRequest, LoginResponse, DashboardData, ApiResponse } from '../types';
export declare const login: (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>) => Promise<void>;
export declare const logout: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getDashboard: (req: AuthRequest, res: Response<ApiResponse<DashboardData>>) => Promise<void>;
export declare const updateStatus: (req: AuthRequest, res: Response<ApiResponse<{
    status: string;
}>>) => Promise<void>;
export declare const getRanking: (req: AuthRequest, res: Response<ApiResponse<{
    ranking: any[];
    periodo: string;
}>>) => Promise<void>;
//# sourceMappingURL=operadorController.d.ts.map