import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import { ExtendedError } from './errors/ExtendedError'
import apiController from './controllers/apiController'
import { gracefulShutdown } from './utils/gracefulShutdown'
import {StatusCodes} from "http-status-codes";

const app = new Hono()

app.onError((err: ExtendedError | Error, c) => {
  if (err instanceof ExtendedError) {
    c.status(err.status)
    return c.json({
      message: err.message,
    })
  }

  return c.json({ error: 'Internal server error' }, StatusCodes.INTERNAL_SERVER_ERROR)
})

app.use(etag(), logger())

app.route('/', apiController)

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

export default app
