import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const resolvedBaseDir = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        const relativePath = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '')
        const filePath = path.resolve(resolvedBaseDir, `.${relativePath}`)

        if (
            filePath !== resolvedBaseDir &&
            !filePath.startsWith(`${resolvedBaseDir}${path.sep}`)
        ) {
            return next()
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }

            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
