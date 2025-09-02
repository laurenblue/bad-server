import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { doubleCsrf } from 'csrf-csrf'
import rateLimit from 'express-rate-limit'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => 'your-very-secret-key',
    getSessionIdentifier: (req) => req.ip || '',
})

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }))

app.use('/api/images', serveStatic(path.join(__dirname, 'public', 'images')))
app.use(urlencoded({ extended: true, limit: '10mb' }))
app.use(json({ limit: '10mb' }))
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: 'Too many requests, please try again later.',
})

app.use(limiter)
app.options('*', cors({ origin: ORIGIN_ALLOW, credentials: true }))
app.use('/api', routes)
app.use(errors())
app.use(errorHandler)

app.get('/csrf-token', (req, res) => {
    const csrfToken = generateCsrfToken(req, res)
    res.send({ csrfToken })
})

app.use(doubleCsrfProtection)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
