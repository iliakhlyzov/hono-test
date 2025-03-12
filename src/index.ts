import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import {cacheService} from "./services/cacheService";
import {SkinportGetItemsResponse} from "./types/externalApi/skinportService";
import {skinportService} from "./externalApi/skinportService";

const app = new Hono()

app.use(etag(), logger())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/skinport', async (c) => {
  const cacheKey = "skinport:data";
  const ttl = 300

  const data = await cacheService.getOrSet<SkinportGetItemsResponse>(cacheKey, async () => {
    return skinportService.getItemsV1()
  }, ttl);

  return c.json(data);
})

export default app
