import { CycleEntry, UserSettings } from './types';
import { DB_NAME, DB_VERSION, DEFAULT_SETTINGS } from './constants';
import { generateKey, exportKey, importKey, encrypt, decrypt } from './encryption';
import { logger } from './logger';

let db: IDBDatabase | null = null;
let cachedKey: CryptoKey | null = null;

class StorageError extends Error {
  constructor(message: string, public cause?: Error | null) {
    super(message);
    this.name = 'StorageError';
  }
}

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      logger.error('Failed to open database', request.error);
      reject(new StorageError('Failed to open database', request.error));
    };
    
    request.onsuccess = () => {
      db = request.result;
      
      db.onerror = (event) => {
        logger.error('Database error', event);
      };
      
      db.onabort = (event) => {
        logger.warn('Database transaction aborted', event);
      };
      
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
  const key = await getOrCreateKey();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readonly');
    const store = transaction.objectStore('entries');
    const request = store.getAll();
    
    transaction.onerror = () => {
      logger.error('Transaction error when getting entries');
      reject(new StorageError('Transaction error when getting entries'));
    };
    
    request.onerror = () => {
      logger.error('Failed to get entries', request.error);
      reject(new StorageError('Failed to get entries', request.error));
    };
    
    request.onsuccess = async () => {
      const entries = request.result as CycleEntry[];
      const decryptedEntries: CycleEntry[] = [];
      
      for (const entry of entries) {
        try {
          const decryptedNotes = entry.notes && entry.notes.startsWith('ENC:')
            ? await decrypt(entry.notes.slice(4), key)
            : entry.notes;
          decryptedEntries.push({ ...entry, notes: decryptedNotes });
        } catch (error) {
          logger.warn('Failed to decrypt entry notes, storing as-is', entry.id);
          decryptedEntries.push(entry);
        }
      }
      
      decryptedEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      resolve(decryptedEntries);
    };
  });
}

export async function saveEntry(entry: CycleEntry): Promise<void> {
  const database = await initDB();
  const key = await getOrCreateKey();
  
  let encryptedEntry = entry;
  if (entry.notes) {
    try {
      const encryptedNotes = await encrypt(entry.notes, key);
      encryptedEntry = { ...entry, notes: `ENC:${encryptedNotes}` };
    } catch (error) {
      logger.error('Failed to encrypt notes', error);
      throw new StorageError('Failed to encrypt notes', error instanceof Error ? error : undefined);
    }
  }
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.put(encryptedEntry);
    
    transaction.onerror = () => {
      logger.error('Transaction error when saving entry');
      reject(new StorageError('Transaction error when saving entry'));
    };
    
    request.onerror = () => {
      logger.error('Failed to save entry', request.error);
      reject(new StorageError('Failed to save entry', request.error));
    };
    
    request.onsuccess = () => resolve();
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.delete(id);
    
    transaction.onerror = () => {
      logger.error('Transaction error when deleting entry');
      reject(new StorageError('Transaction error when deleting entry'));
    };
    
    request.onerror = () => {
      logger.error('Failed to delete entry', request.error);
      reject(new StorageError('Failed to delete entry', request.error));
    };
    
    request.onsuccess = () => resolve();
  });
}

export async function getSettings(): Promise<UserSettings> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('user');
    
    transaction.onerror = () => {
      logger.error('Transaction error when getting settings');
      reject(new StorageError('Transaction error when getting settings'));
    };
    
    request.onerror = () => {
      logger.error('Failed to get settings', request.error);
      reject(new StorageError('Failed to get settings', request.error));
    };
    
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
    
    transaction.onerror = () => {
      logger.error('Transaction error when saving settings');
      reject(new StorageError('Transaction error when saving settings'));
    };
    
    request.onerror = () => {
      logger.error('Failed to save settings', request.error);
      reject(new StorageError('Failed to save settings', request.error));
    };
    
    request.onsuccess = () => resolve();
  });
}

export async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('key', 'readonly');
    const store = transaction.objectStore('key');
    const request = store.get('master');
    
    transaction.onerror = () => {
      logger.error('Transaction error when getting key');
      reject(new StorageError('Transaction error when getting key'));
    };
    
    request.onerror = () => {
      logger.error('Failed to get key', request.error);
      reject(new StorageError('Failed to get key', request.error));
    };
    
    request.onsuccess = async () => {
      if (request.result) {
        try {
          cachedKey = await importKey(request.result.key);
          resolve(cachedKey);
        } catch (error) {
          logger.error('Failed to import key', error);
          reject(new StorageError('Failed to import key', error instanceof Error ? error : undefined));
        }
      } else {
        try {
          const newKey = await generateKey();
          const keyString = await exportKey(newKey);
          
          const writeTransaction = database.transaction('key', 'readwrite');
          const writeStore = writeTransaction.objectStore('key');
          
          await new Promise<void>((resolveWrite, rejectWrite) => {
            const writeRequest = writeStore.put({ id: 'master', key: keyString });
            writeRequest.onerror = () => {
              logger.error('Failed to save key', writeRequest.error);
              rejectWrite(new StorageError('Failed to save key', writeRequest.error));
            };
            writeRequest.onsuccess = () => resolveWrite();
            
            writeTransaction.onerror = () => {
              logger.error('Transaction error when saving key');
              rejectWrite(new StorageError('Transaction error when saving key'));
            };
          });
          
          cachedKey = newKey;
          resolve(newKey);
        } catch (error) {
          logger.error('Failed to create key', error);
          reject(new StorageError('Failed to create key', error instanceof Error ? error : undefined));
        }
      }
    };
  });
}

export async function deleteAllData(): Promise<void> {
  const database = await initDB();
  cachedKey = null;
  
  const clearStore = (storeName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      transaction.onerror = () => {
        logger.error(`Transaction error when clearing ${storeName}`);
        reject(new StorageError(`Transaction error when clearing ${storeName}`));
      };
      
      request.onerror = () => {
        logger.error(`Failed to clear ${storeName}`, request.error);
        reject(new StorageError(`Failed to clear ${storeName}`, request.error));
      };
      
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
  const exportEntries = entries.map(e => ({ ...e, notes: '' }));
  return { entries: exportEntries, settings };
}