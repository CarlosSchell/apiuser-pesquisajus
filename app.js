const express = require('express')
// const  fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const cors = require('cors')
const AppError = require('./utils/appError.js')
const globalErrorHandler = require('./controllers/errorController.js')
const userRouter = require('./routes/userRoutes.js')
const procRouter = require('./routes/procRoutes.js')
const procEsRouter = require('./routes/procEsRoutes.js')
const generalRouter = require('./routes/generalRoutes.js')

// Start express app
const app = express()

// app.enable('trust proxy')
// const __dirname = path.resolve()

// 1) GLOBAL MIDDLEWARES
app.use(cors())

// Access-Control-Allow-Origin *
// www.pesquisajus.com, www.pesquisajus.com.br
// app.use(cors({
//   origin: ['https://www.pesquisajus.com.br', 'https://www.pesquisajus.com.br', '189.6.236.218']
// }))

// app.options('/api/v1/tours/:id', cors())

app.options('*', cors()) // allow complex requests - put, patch, delete -> uses preflight request - OPTION

// Serving static files
console.log('App dirname : ', __dirname)

//  /home/api-pesquisajus/apps_nodejs
//  /home/api-pesquisajus/www/public/tjrs
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/', limiter)

// // Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// app.post(
//   '/webhook-checkout',
//   bodyParser.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout
// );

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50mb' }))
// app.use(express.urlencoded({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp())

// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price'
//     ]
//   })
// );

app.use(compression())

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.cookies);
  // console.log('Passou pelo middleware : ', new Date().toISOString());
  next()
})

// 3) ROUTES
app.use('/v1/geral', generalRouter)
app.use('/v1/publicacao/db', procRouter)
app.use('/v1/publicacao/es', procEsRouter)
app.use('/v1/users', userRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Erro no servidor - 404 - Url ${req.originalUrl} não encontrada`, 404))
})

app.use(globalErrorHandler)

module.exports = app
