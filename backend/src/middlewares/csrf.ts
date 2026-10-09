import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import ForbiddenError from '../errors/forbidden-error'

const CSRF_COOKIE = '_csrf'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const getCsrfToken = (_req: Request, res: Response) => {
    const csrfToken = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE, csrfToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
    })
    return res.json({ csrfToken })
}

export const csrfProtection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (SAFE_METHODS.has(req.method)) {
        return next()
    }

    const headerToken = req.get('X-CSRF-Token')
    const cookieToken = req.cookies?.[CSRF_COOKIE]

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        return next(new ForbiddenError('Невалидный CSRF токен'))
    }

    return next()
}
