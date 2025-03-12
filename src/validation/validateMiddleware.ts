import { ZodSchema } from "zod";
import { Context, Next } from "hono";

export const validateSchema = (schema: ZodSchema) => {
    return async (c: Context, next: Next) => {
        const body = await c.req.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            return c.json({ error: "Invalid request format", details: result.error.format() }, 400);
        }

        await next();
    };
};
