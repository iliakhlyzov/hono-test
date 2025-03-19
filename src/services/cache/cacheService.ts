import Redis from 'ioredis'
import { redisConfig } from '../../config/redisConfig'
import type { CacheClient } from '../../types/services/CacheClient'
import {Logger} from "../../utils/logger";

class CacheService implements CacheClient {
  private client: Redis

  constructor() {
    this.client = new Redis(redisConfig)

    this.client.on('ready', () => {
      Logger.info('Redis is ready!')
    })

    this.client.on('error', (err) => {
      Logger.error('Redis error:', { error: err})
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
      Logger.error('Redis set error:', {error})
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key)

      return data ? JSON.parse(data) : null
    } catch (error) {
      Logger.error('Redis get error:', {error})
      return null
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      Logger.error('Redis delete error:', {error})
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      const cachedData = await this.get<T>(key)

      if (cachedData !== null) {
        return cachedData
      }

      const freshData = await fetchFunction()

      await this.set(key, freshData, ttl)

      return freshData
    } catch (error) {
      Logger.error('Redis getOrSet error:', {error})
      throw error
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushall()
    } catch (error) {
      Logger.error('Redis flush error:', {error})
    }
  }
}

export const cacheService = new CacheService()
