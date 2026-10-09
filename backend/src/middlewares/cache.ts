import { NextFunction, Request, Response } from 'express'

type CacheEntry = {
    expiresAt: number
    body: unknown
    statusCode: number
}

const cacheStore = new Map<string, CacheEntry>()
const DEFAULT_TTL_MS = 30_000

const cache =
    (ttlMs = DEFAULT_TTL_MS) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            return next()
        }

        const key = req.originalUrl
        const cached = cacheStore.get(key)

        if (cached && cached.expiresAt > Date.now()) {
            return res.status(cached.statusCode).json(cached.body)
        }

        const originalJson = res.json.bind(res)
        res.json = (body: unknown) => {
            cacheStore.set(key, {
                body,
                statusCode: res.statusCode,
                expiresAt: Date.now() + ttlMs,
            })
            return originalJson(body)
        }

        return next()
    }

export default cache
