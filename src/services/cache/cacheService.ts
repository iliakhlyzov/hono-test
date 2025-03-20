import Redis from 'ioredis'
import { redisConfig } from '../../config/redisConfig'

class CacheService {
  private client: Redis | null = null
  private isReady = false

  constructor() {
    this.createClient()
  }

  private createClient() {
    if (this.client) {
      console.warn('⚠️ Redis client already exists, skipping reinitialization.')
      return
    }

    console.log('🔌 Initializing Redis client...')

    this.client = new Redis({
      ...redisConfig,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 1000, 500),
    })

    this.setupListeners()
  }

  private setupListeners() {
    if (!this.client) return

    this.client.on('ready', async () => {
      console.info('✅ Redis is ready!')
      this.isReady = true
    })

    this.client.on('connect', async () => {
      this.isReady = true
      console.log('🔗 Redis connected')
    })

    this.client.on('error', async (err) => {
      console.error(`❌ Redis error: ${err.message}`)
      this.isReady = false
    })

    this.client.on('end', async () => {
      console.warn('⚠️ Redis connection closed.')
      this.isReady = false
    })
  }

  public getClient(): Redis {
    if (!this.client) {
      console.warn(
        '⚠️ Redis client is not initialized. Creating a new instance.',
      )
      this.createClient()
    }

    return this.client as Redis
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const client = this.getClient()
      if (!this.isReady) {
        throw new Error('Redis is not ready')
      }

      const data = JSON.stringify(value)
      if (ttl) {
        await client.set(key, data, 'EX', ttl)
      } else {
        await client.set(key, data)
      }
    } catch (error) {
      console.error('❌ Redis set error:', error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = this.getClient()

      if (!this.isReady) {
        throw new Error('Redis is not ready')
      }

      const data = await client.get(key)

      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('❌ Redis get error:', error)
      return null
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
        console.log(`✅ Found cached data for key: '${key}'`)
        return cachedData
      }

      const freshData = await fetchFunction()
      await this.set(key, freshData, ttl)
      return freshData
    } catch (error) {
      console.error('❌ Redis getOrSet error:', error)
      return null
    }
  }

  async del(key: string): Promise<void> {
    try {
      const client = this.getClient()
      if (!this.isReady) {
        throw new Error('Redis is not ready')
      }

      await client.del(key)
    } catch (error) {
      console.error('❌ Redis delete error:', error)
    }
  }

  async flush(): Promise<void> {
    try {
      const client = this.getClient()
      if (!this.isReady) {
        throw new Error('Redis is not ready')
      }

      await client.flushall()
    } catch (error) {
      console.error('❌ Redis flush error:', error)
    }
  }
}

export const cacheService = new CacheService()
