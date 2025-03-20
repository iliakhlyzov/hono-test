import postgres from 'postgres'
import { dbConfig } from '../config/dbConfig'
import { Logger } from '../utils/logger'

class DatabaseService {
  private sql: ReturnType<typeof postgres> | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 10

  constructor() {
    this.connect()
  }

  private connect() {
    if (this.sql) {
      Logger.warn('Attempting to reconnect to PostgreSQL...')
    }

    this.sql = postgres({
      ...dbConfig,
      onclose: () => {
        Logger.warn('PostgreSQL connection closed. Attempting reconnect...')
        this.isConnected = false
        this.reconnect()
      },
    })

    this.checkConnection()
  }

  private async checkConnection() {
    try {
      if (!this.sql) return
      await this.sql`SELECT 1`
      this.isConnected = true
      this.reconnectAttempts = 0
      Logger.info('Database connection verified.')
    } catch (error) {
      this.isConnected = false
      Logger.error('Database connection failed:', { error })
      await this.reconnect()
    }
  }

  private async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Logger.error('Max reconnect attempts reached. Giving up.')
      return
    }

    console.log('here')
    this.reconnectAttempts++
    Logger.warn(`Reconnect attempt #${this.reconnectAttempts}...`)

    await Bun.sleep(5000)
    this.connect()
  }

  async query<T>(
    query: string,
    params?: (number | string | boolean)[],
  ): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('Database is not connected.')
    }

    try {
      const timeoutPromise = new Promise<T[]>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout exceeded')), 5000),
      )

      return (await Promise.race([
        this.sql!.unsafe(query, params),
        timeoutPromise,
      ])) as T[]
    } catch (error) {
      Logger.error('Postgres query error:', { error })
      throw error
    }
  }

  async close(): Promise<void> {
    try {
      if (this.sql) {
        await this.sql.end()
      }
      this.isConnected = false
      Logger.info('Database connection closed.')
    } catch (error) {
      Logger.error('Error closing database connection:', { error })
    }
  }
}

export const databaseService = new DatabaseService()
