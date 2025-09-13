import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
export declare const iniciarChamada: (req: AuthRequest, res: Response<ApiResponse<{
    chamada_id: number;
    operador_id: number;
    status: string;
}>>) => Promise<void>;
export declare const finalizarChamada: (req: AuthRequest, res: Response<ApiResponse<{
    duracao_segundos: number;
    pontos_ganhos: number;
    status: string;
}>>) => Promise<void>;
export declare const getHistorico: (req: AuthRequest, res: Response<ApiResponse<{
    chamadas: any[];
    paginacao: {
        total: number;
        limite: number;
        offset: number;
    };
}>>) => Promise<void>;
export declare const getEstatisticas: (req: AuthRequest, res: Response<ApiResponse<{
    periodo: string;
    total_chamadas: number;
    tempo_total_minutos: number;
    tempo_medio_minutos: number;
    satisfacao_media: number;
    taxa_resolucao: number;
    pontos_ganhos: number;
}>>) => Promise<void>;
//# sourceMappingURL=chamadaController.d.ts.map