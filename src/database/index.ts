import postgres from 'postgres'

class DatabaseService {
  private sql

  constructor() {
    this.sql = postgres({
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'postgres',
    })
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
