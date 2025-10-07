import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authenticateEmpresa: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireEmpresa: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=empresaAuth.d.ts.map