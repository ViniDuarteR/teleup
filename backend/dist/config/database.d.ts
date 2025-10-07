import { Pool } from 'pg';
export declare const pool: {
    execute<T = any>(query: string, params?: any[]): Promise<[T[], any]>;
    query<T = any>(query: string, params?: any[]): Promise<T[]>;
    readonly native: Pool;
};
export declare const testConnection: () => Promise<boolean>;
export default pool;
//# sourceMappingURL=database.d.ts.map