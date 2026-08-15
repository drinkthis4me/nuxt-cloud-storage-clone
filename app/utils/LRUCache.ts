export class LRUCache<K, V> {
  cache: Map<K, V>
  capacity: number

  constructor(capacity: number = 10) {
    this.cache = new Map()
    this.capacity = capacity
  }

  get(key: K): V | null {
    if (!this.cache.has(key)) return null
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key: K, value: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size === this.capacity) {
      const firstKey = this.cache.keys().next().value!
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}
