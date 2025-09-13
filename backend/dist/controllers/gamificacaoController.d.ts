import { Response } from 'express';
import { AuthRequest, ApiResponse, EstatisticasGamificacao } from '../types';
export declare const getMissoes: (req: AuthRequest, res: Response<ApiResponse<any[]>>) => Promise<void>;
export declare const getConquistas: (req: AuthRequest, res: Response<ApiResponse<any[]>>) => Promise<void>;
export declare const verificarConquistas: (req: AuthRequest, res: Response<ApiResponse<{
    novas_conquistas: any[];
    total_novas: number;
}>>) => Promise<void>;
export declare const getRankingGeral: (req: AuthRequest, res: Response<ApiResponse<{
    ranking: any[];
    periodo: string;
    tipo: string;
}>>) => Promise<void>;
export declare const getEstatisticasGamificacao: (req: AuthRequest, res: Response<ApiResponse<EstatisticasGamificacao>>) => Promise<void>;
//# sourceMappingURL=gamificacaoController.d.ts.map