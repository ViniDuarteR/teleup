import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getRecompensas: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompras: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const comprarRecompensa: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const criarRecompensa: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const atualizarRecompensa: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const excluirRecompensa: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleDisponibilidade: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=lojaController.d.ts.map