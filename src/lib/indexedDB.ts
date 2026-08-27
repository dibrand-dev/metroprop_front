const DB_NAME = 'metroprop-cache-db';
const STORE_NAME = 'api-cache-store';
const KEY_LOCATIONS = 'locations-global';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachePayload<T> {
  data: T;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB opening failed, falling back to network:', event);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB not supported or permission denied:', e);
      resolve(null);
    }
  });
}

export async function getCachedLocations<T>(): Promise<T | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_LOCATIONS);

      request.onsuccess = () => {
        const result = request.result as CachePayload<T> | undefined;
        if (result && result.data && Date.now() - result.timestamp < CACHE_EXPIRY_MS) {
          resolve(result.data);
        } else {
          resolve(null); // Expired or missing
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch (e) {
      console.error('Failed to get cached locations from IndexedDB:', e);
      resolve(null);
    }
  });
}

export async function setCachedLocations<T>(data: T): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const payload: CachePayload<T> = {
        data,
        timestamp: Date.now(),
      };
      const request = store.put(payload, KEY_LOCATIONS);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}
