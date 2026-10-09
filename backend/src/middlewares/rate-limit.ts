import { NextFunction, Request, Response } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const isEnabled = process.env.RATE_LIMITED !== 'false'

const rateLimiter = new RateLimiterMemory({
    points: Number(process.env.RATE_LIMIT_POINTS ?? 100),
    duration: Number(process.env.RATE_LIMIT_DURATION ?? 60),
    blockDuration: Number(process.env.RATE_LIMIT_BLOCK ?? 60),
})

const shouldSkip = (req: Request) =>
    req.method === 'OPTIONS' || req.path === '/auth/csrf-token'

const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
    if (!isEnabled || shouldSkip(req)) {
        return next()
    }

    try {
        await rateLimiter.consume(req.ip || 'anonymous')
        return next()
    } catch {
        return res.status(429).send({ message: 'Слишком много запросов' })
    }
}

export default rateLimit
