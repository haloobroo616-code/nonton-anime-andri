export const DB_NAME = 'NimeStreamDB_React';
export const STORE_HISTORY = 'history';
export const STORE_FAV = 'favorites';

export function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1); 
        req.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_HISTORY)) db.createObjectStore(STORE_HISTORY, { keyPath: 'url' });
            if (!db.objectStoreNames.contains(STORE_FAV)) db.createObjectStore(STORE_FAV, { keyPath: 'url' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function saveHistory(animeObj: any) {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_HISTORY, 'readwrite');
        animeObj.timestamp = Date.now();
        tx.objectStore(STORE_HISTORY).put(animeObj);
    } catch(e) {}
}

export async function getHistory(): Promise<any[]> {
    try {
        const db = await initDB();
        return new Promise((resolve) => {
            const req = db.transaction(STORE_HISTORY, 'readonly').objectStore(STORE_HISTORY).getAll();
            req.onsuccess = () => resolve(req.result.sort((a,b) => b.timestamp - a.timestamp));
        });
    } catch(e) { return []; }
}

export async function toggleFavorite(url: string, title: string, image: string, score: string) {
    try {
        const db = await initDB();
        const isFav = await checkFavorite(url);
        const tx = db.transaction(STORE_FAV, 'readwrite');
        const store = tx.objectStore(STORE_FAV);
        
        if (isFav) {
            store.delete(url);
        } else {
            store.put({url, title, image, score, timestamp: Date.now()});
        }
    } catch(e) {}
}

export async function checkFavorite(url: string): Promise<boolean> {
    try {
        const db = await initDB();
        return new Promise((resolve) => {
            const req = db.transaction(STORE_FAV, 'readonly').objectStore(STORE_FAV).get(url);
            req.onsuccess = () => resolve(!!req.result);
        });
    } catch(e) { return false; }
}

export async function getFavorites(): Promise<any[]> {
    try {
        const db = await initDB();
        return new Promise((resolve) => {
            const req = db.transaction(STORE_FAV, 'readonly').objectStore(STORE_FAV).getAll();
            req.onsuccess = () => resolve(req.result.sort((a,b) => b.timestamp - a.timestamp));
        });
    } catch(e) { return []; }
}
