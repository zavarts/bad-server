import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import { csrfProtection } from './middlewares/csrf'
import errorHandler from './middlewares/error-handler'
import rateLimit from './middlewares/rate-limit'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000, ORIGIN_ALLOW = 'http://localhost:5173' } = process.env
const app = express()

app.set('trust proxy', 1)

app.use(rateLimit)

app.use(
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)
app.use(cookieParser())
app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '10kb' }))
app.use(json({ limit: '10kb' }))
app.use(mongoSanitize())
app.use(csrfProtection)
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
