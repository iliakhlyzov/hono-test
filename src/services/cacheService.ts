import Redis from 'ioredis'

class CacheService {
  private client: Redis

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    })

    this.client.on('ready', () => {
      console.log('Redis is ready!')
    })

    this.client.on('error', (err) => {
      console.error('Redis error:', err)
    })
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value)
      if (ttl) {
        await this.client.set(key, data, 'EX', ttl)
      } else {
        await this.client.set(key, data)
      }
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number,
  ): Promise<T | null> {
    try {
      const cachedData = await this.get<T>(key)
      if (cachedData !== null) {
        return cachedData
      }

      const freshData = await fetchFunction()
      await this.set(key, freshData, ttl)
      return freshData
    } catch (error) {
      console.error('Redis getOrSet error:', error)
      throw error
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushall()
    } catch (error) {
      console.error('Redis flush error:', error)
    }
  }
}

export const cacheService = new CacheService()
