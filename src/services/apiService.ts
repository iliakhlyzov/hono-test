import { getSkinportItemsKey } from '../const/cacheKeys'
import { DEFAULT_APP_ID, DEFAULT_TTL } from '../const/cacheService'
import { Currency } from '../types/services/skinportService/currency'
import type { MarketItem } from '../types/services/skinportService/skinportService'
import { databaseService } from '../database'
import type { PostPurchaseRequestBody } from '../types/controllers/apiController'
import { cacheService } from './cache/cacheService'
import { skinportService } from './externalApi/skinportService'

export class ApiService {
  async getSkinportItems(
    appId: number = DEFAULT_APP_ID,
    currency: Currency = Currency.EUR,
    tradable: 0 | 1 = 0,
  ): Promise<MarketItem[]> {
    return cacheService.getOrSet(
      getSkinportItemsKey(appId, currency, tradable),
      async () => skinportService.getItemsV1(appId, currency, tradable),
      DEFAULT_TTL,
    )
  }

  async processPurchase({
    userId,
    productId,
  }: PostPurchaseRequestBody): Promise<{
    success: boolean
    balance?: number
    error?: string
  }> {
    try {
      const queryResult: { balance: number }[] = await databaseService.query(
        `WITH updated AS (
                UPDATE users
                SET balance = balance - (SELECT price FROM products WHERE id = $2)
                WHERE id = $1 AND balance >= (SELECT price FROM products WHERE id = $2)
                    RETURNING balance
        )
                INSERT INTO purchases (user_id, product_id)
                SELECT $1, $2 FROM updated
         RETURNING (SELECT balance FROM updated);`,
        [userId, productId],
      )

      if (!queryResult.length) {
        return {
          success: false,
          error: 'Insufficient balance or invalid user/product',
        }
      }

      console.log(queryResult[0])

      return { success: true, balance: queryResult[0].balance }
    } catch (error) {
      return { success: false, error: 'Transaction failed' }
    }
  }

  async seedDatabase(): Promise<{
    success: boolean
    users?: unknown
    products?: unknown
    error?: string
  }> {
    try {
      await databaseService.query('DELETE FROM purchases;')
      await databaseService.query('DELETE FROM users;')
      await databaseService.query('DELETE FROM products;')

      await databaseService.query(
        `INSERT INTO users (id, name, balance) VALUES ('e644218e-8375-4c78-9530-9b6dbe462c81', 'Test User', 50.00) ON CONFLICT DO NOTHING;`,
      )

      await databaseService.query(
        `INSERT INTO products (id, name, price) VALUES
          ('f97d89b4-39ea-4f0c-9cff-acdd91a9225e', '10 Year Birthday Sticker Capsule', 0.94),
          ('43bd8b86-76c0-4efd-94c6-934676d18120', '1st Lieutenant Farlow | SWAT', 8.10)
        ON CONFLICT DO NOTHING;`,
      )

      const users = await databaseService.query('SELECT * FROM users;')
      const products = await databaseService.query('SELECT * FROM products;')

      return { success: true, users, products }
    } catch (error) {
      return { success: false, error: 'Seeding failed' }
    }
  }
}

export const apiService = new ApiService()
