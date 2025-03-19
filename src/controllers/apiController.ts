import { Hono } from 'hono'
import { validateSchema } from '../middlewares/validateMiddleware'
import { apiControllerGetItemsQuerySchema } from '../validation/schemas/apiController/apiControllerGetItemsQuerySchema'
import { databaseService } from '../database'
import { cacheService } from '../services/cache/cacheService'
import { skinportService } from '../services/externalApi/skinportService'
import { getSkinportItemsKey } from '../const/cacheKeys'
import { DEFAULT_APP_ID, DEFAULT_TTL } from '../const/cacheService'
import { Currency } from '../types/services/skinportService/currency'
import type { MarketItem } from '../types/services/skinportService/skinportService'
import { apiControllerPostPuchaseRequestBodySchema } from '../validation/schemas/apiController/apiControllerPostPuchaseRequestBodySchema'
import type {
  GetSkinportRequestQuery,
  PostPurchaseRequestBody,
} from '../types/controllers/apiController'
import {StatusCodes} from "http-status-codes";

const apiController = new Hono()

apiController.get('/', (c) => c.text('Hello Hono!'))

apiController.get(
  '/skinport',
  validateSchema({ query: apiControllerGetItemsQuerySchema }),
  async (c) => {
    const query = c.req.query as GetSkinportRequestQuery
    const {
      appId = DEFAULT_APP_ID,
      currency = Currency.EUR,
      tradable = 0,
    } = query

    const data = await cacheService.getOrSet<MarketItem[]>(
      getSkinportItemsKey(appId, currency, tradable),
      async () => {
        return skinportService.getItemsV1(appId, currency, tradable)
      },
      DEFAULT_TTL,
    )

    return c.json(data)
  },
)

apiController.post(
  '/purchase',
  validateSchema({
    body: apiControllerPostPuchaseRequestBodySchema,
  }),
  async (c) => {
    const { userId, productId } =
      (await c.req.json()) as PostPurchaseRequestBody
    let queryResult: { id: string; balance: number }[]

    try {
      queryResult = await databaseService.query(
        `WITH updated AS (
          UPDATE users
          SET balance = balance - (SELECT price FROM products WHERE id = $2)
          WHERE id = $1 AND balance >= (SELECT price FROM products WHERE id = $2)
              RETURNING balance
            )
          INSERT INTO purchases (user_id, product_id)
          SELECT $1, $2 FROM updated
         RETURNING *;`,
        [userId, productId],
      )
    } catch (error) {
      return c.json({ error: 'Transaction failed' }, StatusCodes.INTERNAL_SERVER_ERROR)
    }

    if (!queryResult.length) {
      return c.json(
        { error: 'Insufficient balance or invalid user/product' },
        StatusCodes.BAD_REQUEST,
      )
    }

    return c.json({
      success: true,
      message: 'Purchase completed',
      data: { userId, productId, balance: queryResult[0].balance },
    })
  },
)

apiController.post('/seed', async (c) => {
  try {
    await databaseService.query(
      `INSERT INTO users (name, balance) VALUES ('Test User', 50.00) ON CONFLICT DO NOTHING;`,
    )

    await databaseService.query(
      `INSERT INTO products (name, price) VALUES
        ('10 Year Birthday Sticker Capsule', 0.94),
        ('1st Lieutenant Farlow | SWAT', 8.10),
        ('2020 RMR Challengers', 0.20),
        ('2020 RMR Contenders', 0.33),
        ('2020 RMR Legends', 0.18),
        ('2021 Community Sticker Capsule', 0.94)
                ON CONFLICT DO NOTHING;`,
    )

    const users = await databaseService.query('SELECT * FROM users;')
    const products = await databaseService.query('SELECT * FROM products;')

    return c.json({
      success: true,
      message: 'Database seeded successfully',
      users,
      products,
    })
  } catch (error) {
    return c.json({ error: 'Seeding failed' }, StatusCodes.INTERNAL_SERVER_ERROR)
  }
})

export default apiController
