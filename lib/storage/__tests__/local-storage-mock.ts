/**
 * A localStorage stand-in for the node test environment.
 *
 * Data is held as own enumerable properties and the Storage methods are
 * defined non-enumerably, so `Object.keys(localStorage)` returns the stored
 * keys — which is what `clearAllData()`'s stray-key sweep relies on.
 */
export function createLocalStorageMock(): Storage {
  const store = {} as Record<string, string> & Storage

  const methods: Record<string, unknown> = {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key: string, value: string) {
      store[key] = String(value)
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      for (const key of Object.keys(store)) delete store[key]
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null
    },
    get length() {
      return Object.keys(store).length
    },
  }

  for (const [name, value] of Object.entries(methods)) {
    const descriptor = Object.getOwnPropertyDescriptor(methods, name)!
    Object.defineProperty(store, name, { ...descriptor, enumerable: false })
    void value
  }

  return store
}

/** Install the mock (plus a minimal `window`) on globalThis. */
export function installLocalStorageMock(): Storage {
  const mock = createLocalStorageMock()
  // The storage module gates every write on `typeof window !== 'undefined'`.
  ;(globalThis as Record<string, unknown>).window = globalThis
  ;(globalThis as Record<string, unknown>).localStorage = mock
  return mock
}

export function uninstallLocalStorageMock(): void {
  delete (globalThis as Record<string, unknown>).window
  delete (globalThis as Record<string, unknown>).localStorage
}
