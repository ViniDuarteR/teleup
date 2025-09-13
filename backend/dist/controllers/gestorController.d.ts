import { Response } from 'express';
import { AuthRequest, ApiResponse, MetricasEquipe, OperadorDesempenho } from '../types';
export declare const getMetricasEquipe: (req: AuthRequest, res: Response<ApiResponse<MetricasEquipe>>) => Promise<void>;
export declare const getRankingOperadores: (req: AuthRequest, res: Response<ApiResponse<{
    ranking: any[];
    periodo: string;
}>>) => Promise<void>;
export declare const getDesempenhoDetalhado: (req: AuthRequest, res: Response<ApiResponse<{
    operadores: OperadorDesempenho[];
    periodo: string;
}>>) => Promise<void>;
export declare const criarMissao: (req: AuthRequest, res: Response<ApiResponse<{
    missao_id: number;
}>>) => Promise<void>;
export declare const atribuirMissao: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getOperadores: (req: AuthRequest, res: Response<ApiResponse<any[]>>) => Promise<void>;
//# sourceMappingURL=gestorController.d.ts.map