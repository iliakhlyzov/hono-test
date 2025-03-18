import postgres from 'postgres'
import { dbConfig } from '../config/dbConfig'

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
      console.error('Postgres query error:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    try {
      await this.sql.end()
      console.log('Database connection closed.')
    } catch (error) {
      console.error('Error closing database connection:', error)
    }
  }
}

export const databaseService = new DatabaseService()
