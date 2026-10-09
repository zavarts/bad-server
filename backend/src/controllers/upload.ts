import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { unlink } from 'fs/promises'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

const MIN_FILE_SIZE = Number(process.env.MIN_FILE_SIZE) || 2 * 1024

const removeTempFile = async (filePath?: string) => {
    if (!filePath) {
        return
    }
    try {
        await unlink(filePath)
    } catch {
        // ignore cleanup errors
    }
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    try {
        if (req.file.size < MIN_FILE_SIZE) {
            await removeTempFile(req.file.path)
            return next(new BadRequestError('Файл слишком маленький'))
        }

        try {
            await sharp(req.file.path).metadata()
        } catch {
            await removeTempFile(req.file.path)
            return next(new BadRequestError('Некорректный файл изображения'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        await removeTempFile(req.file.path)
        return next(error)
    }
}

export default {}
