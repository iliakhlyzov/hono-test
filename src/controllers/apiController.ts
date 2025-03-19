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
import { StatusCodes } from 'http-status-codes'
import { apiService } from '../services/apiService'

const apiController = new Hono()

apiController.get('/', (c) => c.text('Hello Hono!'))

apiController.get(
  '/skinport',
  validateSchema({ query: apiControllerGetItemsQuerySchema }),
  async (c) => {
    const query = c.req.query as GetSkinportRequestQuery

    const data = await apiService.getSkinportItems(
      query.appId,
      query.currency,
      query.tradable,
    )

    return c.json(data)
  },
)

apiController.post(
  '/purchase',
  validateSchema({ body: apiControllerPostPuchaseRequestBodySchema }),
  async (c) => {
    const purchaseData = (await c.req.json()) as PostPurchaseRequestBody
    const result = await apiService.processPurchase(purchaseData)

    if (!result.success) {
      return c.json({ error: result.error }, StatusCodes.BAD_REQUEST)
    }

    return c.json({
      success: true,
      message: 'Purchase completed',
      data: {
        userId: purchaseData.userId,
        productId: purchaseData.productId,
        balance: result.balance,
      },
    })
  },
)

apiController.post('/seed', async (c) => {
  const result = await apiService.seedDatabase()

  if (!result.success) {
    return c.json({ error: result.error }, StatusCodes.INTERNAL_SERVER_ERROR)
  }

  return c.json({
    success: true,
    message: 'Database seeded successfully',
    users: result.users,
    products: result.products,
  })
})

export default apiController
