import { CycleEntry, UserSettings } from './types';
import { DB_NAME, DB_VERSION, DEFAULT_SETTINGS } from './constants';
import { generateKey, exportKey, importKey } from './encryption';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains('entries')) {
        database.createObjectStore('entries', { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
      
      if (!database.objectStoreNames.contains('key')) {
        database.createObjectStore('key', { keyPath: 'id' });
      }
    };
  });
}

export async function getEntries(): Promise<CycleEntry[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readonly');
    const store = transaction.objectStore('entries');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const entries = (request.result as CycleEntry[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      resolve(entries);
    };
  });
}

export async function saveEntry(entry: CycleEntry): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.put(entry);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSettings(): Promise<UserSettings> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('user');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve((request.result?.value as UserSettings) || DEFAULT_SETTINGS);
    };
  });
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key: 'user', ...settings });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getOrCreateKey(): Promise<CryptoKey> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('key', 'readonly');
    const store = transaction.objectStore('key');
    const request = store.get('master');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = async () => {
      if (request.result) {
        const key = await importKey(request.result.key);
        resolve(key);
      } else {
        const newKey = await generateKey();
        const keyString = await exportKey(newKey);
        
        const writeTransaction = database.transaction('key', 'readwrite');
        const writeStore = writeTransaction.objectStore('key');
        writeStore.put({ id: 'master', key: keyString });
        
        resolve(newKey);
      }
    };
  });
}

export async function deleteAllData(): Promise<void> {
  const database = await initDB();
  
  const clearStore = (storeName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  };
  
  await Promise.all([
    clearStore('entries'),
    clearStore('settings'),
    clearStore('key'),
  ]);
}

export async function exportAllData(): Promise<{ entries: CycleEntry[]; settings: UserSettings }> {
  const entries = await getEntries();
  const settings = await getSettings();
  return { entries, settings };
}
