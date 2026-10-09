import { ErrorRequestHandler } from 'express'
import { MulterError } from 'multer'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err?.type === 'entity.too.large') {
        res.status(413).send({ message: 'Слишком большой размер запроса' })
        return next()
    }

    if (err instanceof MulterError) {
        res.status(400).send({ message: err.message })
        return next()
    }

    const statusCode = err.statusCode || err.status || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message

    res.status(statusCode).send({ message })

    return next()
}

export default errorHandler
