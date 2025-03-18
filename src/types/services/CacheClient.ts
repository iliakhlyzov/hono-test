export interface CacheClient {
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  get<T>(key: string): Promise<T | null>
  del(key: string): Promise<void>
  getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number,
  ): Promise<T | null>
  flush(): Promise<void>
}
