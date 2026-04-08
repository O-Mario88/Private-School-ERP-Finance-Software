declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string, params?: any[]): { columns: string[]; values: any[][] }[];
    getRowsModified(): number;
    export(): Uint8Array;
    close(): void;
    prepare(sql: string): Statement;
  }
  export interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    getAsObject(params?: object): Record<string, any>;
    get(params?: any[]): any[];
    free(): void;
    reset(): void;
  }
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }
  export interface SqlJsOptions {
    locateFile?: (file: string) => string;
  }
  export default function initSqlJs(options?: SqlJsOptions): Promise<SqlJsStatic>;
}
