import type { ZodSchema } from 'zod'
import type { Context, Next } from 'hono'
import {StatusCodes} from "http-status-codes";

export const validateSchema = (schemas: {
  body?: ZodSchema
  query?: ZodSchema
}) => {
  return async (c: Context, next: Next) => {
    const errors: Record<string, unknown> = {}

    if (schemas.body) {
      const body = await c.req.json().catch(() => null)
      const result = schemas.body.safeParse(body)

      if (!result.success) errors.body = result.error.format()
    }

    if (schemas.query) {
      const query = c.req.query()
      const result = schemas.query.safeParse(query)

      if (!result.success) errors.query = result.error.format()
    }

    if (Object.keys(errors).length)
      return c.json({ error: 'Invalid request', details: errors }, StatusCodes.BAD_REQUEST,)

    await next()
  }
}
