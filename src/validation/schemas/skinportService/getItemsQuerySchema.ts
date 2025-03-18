import { z } from 'zod'
import { Currency } from '../../../types/externalApi/currency'

export const getItemsQuerySchema = z.object({
  appId: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().int().positive().optional(),
  ),
  currency: z.enum([Currency.EUR]).optional(),
  tradable: z.preprocess(
      (val) => (val === "1" ? 1 : val === "0" ? 0 : val),
      z.union([z.literal(0), z.literal(1)])
  ).optional()
})
