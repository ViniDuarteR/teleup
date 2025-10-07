import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getRecompensas: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCompras: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const comprarRecompensa: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=lojaController.d.ts.map