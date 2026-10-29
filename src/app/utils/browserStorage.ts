type StorageName = "localStorage" | "sessionStorage";

function safeStorage(name: StorageName) {
  const memory = new Map<string, string>();
  const pendingWrites = new Set<string>();
  return {
    getItem(key: string): string | null {
      if (pendingWrites.has(key)) return memory.get(key) ?? null;
      try {
        return window[name].getItem(key) ?? memory.get(key) ?? null;
      } catch {
        // Browser privacy settings can reject even accessing the storage getter.
        return memory.get(key) ?? null;
      }
    },
    setItem(key: string, value: string) {
      memory.set(key, value);
      try {
        window[name].setItem(key, value);
        pendingWrites.delete(key);
      } catch {
        // Preferences still work for this open document when persistence is denied.
        pendingWrites.add(key);
      }
    },
  };
}

export const safeLocalStorage = safeStorage("localStorage");
export const safeSessionStorage = safeStorage("sessionStorage");
