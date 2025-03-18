import { z } from 'zod'

export const apiControllerPostPuchaseRequestBodySchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
})
