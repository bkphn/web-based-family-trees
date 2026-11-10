import initSqlJs, { type Database } from 'sql.js';

let dbInstance: Database | null = null;
const STORAGE_KEY = 'family_tree_db'

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS persons_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT,
        birth_date TEXT,
        pos_x REAL DEFAULT 150,
        pos_y REAL DEFAULT 150
    );
`;

export async function getDataBase(): Promise<Database> {
    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs({
        locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm`
    });

    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
        const uInt8Array = new Uint8Array(JSON.parse(savedData));
        dbInstance = new SQL.Database(uInt8Array);
    } else {
        dbInstance = new SQL.Database();

        dbInstance.run(SCHEMA);
        saveDatabase();
    }

    return dbInstance
}

export function saveDatabase(): void {
    if (!dbInstance) return;

    const binaryData = dbInstance.export();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(binaryData)))
}
