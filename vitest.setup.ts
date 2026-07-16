// El store usa zustand/middleware persist con localStorage. Node no lo trae,
// así que le damos un stub en memoria para que los tests del store no exploten.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => void store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size },
  } as Storage
}

// flushQueue() consulta navigator.onLine directo (no el estado del store).
// La dejamos "offline" en los tests: así nunca intenta pegarle a Supabase
// aunque el test no lo mockee, y el comportamiento es igual en cualquier
// versión de Node.
if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true })
} else if (globalThis.navigator.onLine === undefined) {
  Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true })
}
