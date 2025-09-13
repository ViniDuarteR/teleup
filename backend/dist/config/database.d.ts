import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<boolean>;
export { pool };
export default pool;
//# sourceMappingURL=database.d.ts.map