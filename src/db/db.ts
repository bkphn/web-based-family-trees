import initSqlJs, { type Database } from 'sql.js';
import { SCHEMA } from './schema';

let dbInstance: Database | null = null;

const IDB_NAME = 'family_tree';
const IDB_STORE = 'sqlite';
const IDB_KEY = 'db';

function openIdb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function loadFromIdb(): Promise<Uint8Array | null> {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
        const req = idb.transaction(IDB_STORE).objectStore(IDB_STORE).get(IDB_KEY);
        req.onsuccess = () => resolve((req.result as Uint8Array) ?? null);
        req.onerror = () => reject(req.error);
    });
}

async function saveToIdb(data: Uint8Array): Promise<void> {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
        const tx = idb.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(data, IDB_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getDataBase(): Promise<Database> {
    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs({
        locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm`,
    });

    const saved = await loadFromIdb();
    dbInstance = saved ? new SQL.Database(saved) : new SQL.Database();

    dbInstance.run('PRAGMA foreign_keys = ON;');
    dbInstance.run(SCHEMA); // idempotentne (IF NOT EXISTS), więc bezpieczne przy każdym starcie
    await saveDatabase();

    return dbInstance;
}

export async function saveDatabase(): Promise<void> {
    if (!dbInstance) return;
    const data = dbInstance.export();
    dbInstance.run('PRAGMA foreign_keys = ON;');
    await saveToIdb(data);
}