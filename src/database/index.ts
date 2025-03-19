import postgres from 'postgres'
import { dbConfig } from '../config/dbConfig'
import { Logger } from '../utils/logger'

class DatabaseService {
  private sql

  constructor() {
    this.sql = postgres(dbConfig)
  }

  async query<T>(
    query: string,
    params?: (number | string | boolean)[],
  ): Promise<T[]> {
    try {
      return await this.sql.unsafe(query, params)
    } catch (error) {
      Logger.error('Postgres query error:', { error })
      throw error
    }
  }

  async close(): Promise<void> {
    try {
      await this.sql.end()
      Logger.info('Database connection closed.')
    } catch (error) {
      Logger.error('Error closing database connection:', { error })
    }
  }
}

export const databaseService = new DatabaseService()
