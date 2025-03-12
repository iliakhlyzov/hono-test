import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import {cacheService} from "./services/cacheService";
import {SkinportGetItemsResponse} from "./types/externalApi/skinportService";
import {skinportService} from "./externalApi/skinportService";
import {databaseService} from "./database";

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

app.post('/purchase', async (c) => {
  const { userId, productId } = await c.req.json();

  if (!userId || !productId) {
    return c.json({ error: "Invalid input" }, 400);
  }

  try {
    const result = await databaseService.query(
        `WITH updated AS (
        UPDATE users
        SET balance = balance - (SELECT price FROM products WHERE id = $2)
        WHERE id = $1 AND balance >= (SELECT price FROM products WHERE id = $2)
        RETURNING id
      )
      INSERT INTO purchases (user_id, product_id)
      SELECT $1, $2 FROM updated
      RETURNING *;`,
        [userId, productId]
    );

    if (result.length === 0) {
      return c.json({ error: "Insufficient balance or invalid user/product" }, 400);
    }

    return c.json({ success: true, message: "Purchase completed", data: { userId, productId }});
  } catch (error) {
    return c.json({ error: "Transaction failed" }, 500);
  }
})

app.post('/seed', async (c) => {
  try {
    await databaseService.query(
        `INSERT INTO users (name, balance) VALUES ('Test User', 50.00) ON CONFLICT DO NOTHING;`
    );

    await databaseService.query(
        `INSERT INTO products (name, price) VALUES
        ('10 Year Birthday Sticker Capsule', 0.94),
        ('1st Lieutenant Farlow | SWAT', 8.10),
        ('2020 RMR Challengers', 0.20),
        ('2020 RMR Contenders', 0.33),
        ('2020 RMR Legends', 0.18),
        ('2021 Community Sticker Capsule', 0.94)
          ON CONFLICT DO NOTHING;`
    );

    const users = await databaseService.query("SELECT * FROM users;");
    const products = await databaseService.query("SELECT * FROM products;");

    return c.json({ success: true, message: "Database seeded successfully", users, products });
  } catch (error) {
    return c.json({ error: "Seeding failed" }, 500);
  }
});

const gracefulShutdown = async () => {
  console.log("Shutting down server...");
  await databaseService.close();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default app
